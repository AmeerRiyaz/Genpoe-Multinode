import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { PoeService } from 'src/app/core/services/poe.service';
import { Base64File } from 'src/app/shared/models/base64file';
import { const_HTTP_RESPONSE } from 'src/app/shared/models/app-common-constants';
import { UtilsService } from 'src/app/core/services/utils.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { Papa } from 'ngx-papaparse';
import * as XLSX from 'xlsx';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-student-list-upload',
  templateUrl: './student-list-upload.component.html',
  styleUrls: ['./student-list-upload.component.css']
})
export class StudentListUploadComponent implements OnInit, OnDestroy {
  isFileSelected = false
  selectedFile;
  selectedFileName = "No file chosen"
  buttonIcon = 'attachment';
  buttonName = "Choose file"
  @ViewChild('fileInput', { static: true }) fileInput
  fileSelectionForm: FormGroup
  fileSelection: FormControl


  uploadFileRequest: HttpRequestState = new HttpRequestState();
  base64File: Base64File = new Base64File();

  parsedData = []
  parsedDataHeader = []
  parsingDataInProcess = false
  showStatusField = false
  fileExtension = ''
  uploadResponseResult
  constructor(
    private logger: NGXLogger,
    private _formBuilder: FormBuilder,
    private poeService: PoeService,
    private utils: UtilsService,
    private httpRequestStateService: HttpRequestStateService,
    private csvParse: Papa
  ) { }

  ngOnInit() {

    // this.fileSelection=new FormControl('',Validators.pattern('([a-zA-Z0-9\s_\\.\-:])+(.csv|.xls|.xlsx)$'))
    this.fileSelectionForm = this._formBuilder.group({
      fileSelection: ''
    })
  }

  ngOnDestroy(): void {
    this.httpRequestStateService.destroyRequest(this.uploadFileRequest)
  }

  fileChange($event) {

    // this.logger.log("eve", $event)
    // let fileArray: Array<any> = $event.target.files
    let fileArray: Array<any> = [].slice.call($event.target.files)
    this.setFileSelection(fileArray)
    // this.logger.log(fileArray)
    // this.logger.log(fileArray.length)
  }

  setFileSelection(fileArray) {
    // const regex = new RegExp("[a-zA-Z0-9\s_\\.\-:]+(.csv|.xls|.xlsx)$", 'i')
    const regex = new RegExp("^(?!.*(?:\\.(?:exe|sh|js|bat|pdf|zip)(?:\\.|$))).*\\.(?:csv|xls|xlsx)$", 'i')
    console.log(fileArray)
    fileArray = fileArray.filter(({ name }) => name.match(regex));
    console.log(fileArray)
    if (fileArray.length < 1) {
      this.utils.showSnackBar("Please check type of the file, allowed formats are csv xls and xlsx")
      this.resetFileSelection()
      return
    }
    else {
      if (fileArray.length) {
        this.setFileSelction(fileArray)
      } else {
        this.resetFileSelection()
      }
    }
  }
  // getValidationMessage() {
  //    this.fileSelection.hasError('pattern') ? 
  //   this.utils.showSnackBar("Please check type of file, only csv xls & xlsx can be uploaded"): ''
  //   this.resetFileSelection()
  // }
  setFileSelction(fileArray) {
    this.logger.log("setFileSelction() file: ", fileArray[0])
    this.logger.log("setFileSelction() file type: ", fileArray[0].type)
    this.parsingDataInProcess = true
    this.buttonName = "Upload"
    this.buttonIcon = 'cloud_upload'
    this.selectedFile = fileArray[0]
    this.selectedFileName = fileArray[0].name
    this.isFileSelected = true

    this.fileExtension = this.selectedFileName.substr(this.selectedFileName.lastIndexOf('.') + 1)
    this.parsedData = []
    this.parsedDataHeader = []
    this.showStatusField = false
    if (this.fileExtension == "csv") {
      this.csvParse.parse(fileArray[0], {
        complete: (result) => {
          this.parsedDataHeader.push(result.data[0])
          this.parsedDataHeader[0].push('status')
          result.data.splice(0, 1)
          this.parsedData.push(result.data)
          this.logger.log('setFileSelction() CSV parsed: ', this.parsedData);
          this.parsingDataInProcess = false
        }
      });
    } else {
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        /* read workbook */
        const bstr: string = e.target.result;
        // this.logger.log(bstr);
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        var result
        wb.SheetNames.forEach(sheetName => {
          var wsheet = wb.Sheets[sheetName];

          result = XLSX.utils.sheet_to_json(wsheet, { header: 1 });

          // if(!this.parsedDataHeader){
          this.logger.log("setFileSelction() Headers: ", result[0])
          result[0].push('status')
          this.parsedDataHeader.push(result[0])
          // }

          result.splice(0, 1)
          // this.parsedData.push(...result) //spread operation ES6 -> this creates single array all entries

          this.parsedData.push(result) // array of array
          this.logger.log('setFileSelction() XLS parsed: ', this.parsedData);
          console.log(this.parsedDataHeader)

        });
        this.parsingDataInProcess = false

        // /* grab first sheet */
        // const wsname: string = wb.SheetNames[0];
        // const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        // /* save data */
        // var result = XLSX.utils.sheet_to_json(ws, { header: 1 });
        // this.logger.log("setFileSelction() Headers: ", result[0])
        // this.parsedDataHeader = result[0]
        // result.splice(0, 1)
        // this.parsedData = result
        // this.logger.log('setFileSelction() XLS parsed: ', this.parsedData);
        // this.parsingDataInProcess = false
      }
      reader.readAsBinaryString(fileArray[0]);
    }

    this.base64File = this.poeService.generateBase64(this.fileSelectionForm.value, this.selectedFile)
    // this.logger.log(this.base64File)
  }
  resetFileSelection() {
    this.isFileSelected = false
    this.buttonIcon = "attachment"
    this.buttonName = 'Choose file'
    this.selectedFileName = 'No file chosen'
    this.fileSelectionForm.reset()
    this.parsedData = null
    this.parsedDataHeader = null
  }

  uploadFile() {
    this.uploadResponseResult = null
    this.httpRequestStateService.initRequest(this.uploadFileRequest)
    this.uploadFileRequest.subscription = this.poeService.uploadBase64File(this.base64File).subscribe(result => {
      this.logger.log("uploadFile : ", result)
      this.uploadResponseResult = result
      this.showStatusField = true
      if (result.status == const_HTTP_RESPONSE.SUCCESS) {

        var dialogref = this.utils.showDialog("Status", "File uploaded successfully")
        this.httpRequestStateService.finishRequest(this.uploadFileRequest)
        dialogref.afterClosed().subscribe(result => {
          this.resetFileSelection()
        })
      } else {
        this.utils.showDialog("Status", result.message)
        this.httpRequestStateService.finishRequestWithError(this.uploadFileRequest)
      }
    },
      (err: HttpErrorResponse) => {
        // this.logger.log(err.message);
        this.utils.showSnackBar("Something went wrong...")
        this.httpRequestStateService.finishRequestWithError(this.uploadFileRequest)
      });
  }

  getResponseStatus(rollNo) {
    var status = this.uploadResponseResult.result.find(entry => entry.rollNo.toString().trim() === rollNo.toString().trim())
    return status ? status.status : "NA"
  }
  getResponseMessage(rollNo) {
    var status = this.uploadResponseResult.result.find(entry => entry.rollNo.toString().trim() === rollNo.toString().trim())
    return status ? status.message : "NA"
  }
}
