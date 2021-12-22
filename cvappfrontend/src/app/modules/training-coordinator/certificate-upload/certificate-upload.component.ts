import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild, ɵConsole } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from 'src/app/core/services/data.service';
import { HttpRequestStateService } from 'src/app/core/services/http-request-state.service';
import { PoeService } from 'src/app/core/services/poe.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { const_HTTP_RESPONSE } from 'src/app/shared/models/app-common-constants';
import { GetBatchListRequest } from 'src/app/shared/models/get-batch-list-request';
import { GetCourseListRequest } from 'src/app/shared/models/get-course-list-request';
import { GetRollNoListRequest } from 'src/app/shared/models/get-roll-no-list-request';
import { GetYearListRequest } from 'src/app/shared/models/get-year-list-request';
import { HttpRequestState } from 'src/app/shared/models/http-request-state';
import { LoadingSpinnerService } from 'src/app/core/services/loading-spinner.service';
import { NGXLogger } from 'ngx-logger';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-certificate-upload',
  templateUrl: './certificate-upload.component.html',
  styleUrls: ['./certificate-upload.component.css']
})

export class CertificateUploadComponent implements OnInit, OnDestroy {
  uploadProgress = 0;
  isFileUploaded = false
  multiUploadStatus = []

  //form variables
  selectionForm: FormGroup
  uploadForm: FormGroup

  // centre = new FormControl('', [Validators.required])
  year = new FormControl('', [Validators.required])
  batch = new FormControl('', [Validators.required])
  course = new FormControl('', [Validators.required])
  docType = new FormControl('', [Validators.required])
  issuedTo = new FormControl([], [Validators.required])

  //file selector variables
  fileSelection = new FormControl('')
  folderSelection = new FormControl('')
  selectionDone = false
  selectedFiles = []

  buttonIcon = 'attachment';
  buttonName = "Choose"
  @ViewChild('fileInput', { static: true }) fileInput
  @ViewChild('folderInput', { static: true }) folderInput

  //request variables
  // getCentreListRequsetState: HttpRequestState = new HttpRequestState();
  poeTransaction: any
  splitResult: any
  uploadRequest: HttpRequestState = new HttpRequestState();
  uploadResponseResultArray

  //data variables 
  docTypes = ['Certificate', 'Marksheet']
  // centreList
  yearList
  batchList
  courseList
  rollNoList = []

  selectedUploadGroup = 'file' //default
  isFileSplitMode = false;
  isSplitingDone = false
  minimumValidMatch = 0 // containes minimum of rollno or certificates selected to upload

  statValues = [0, 0]
  statLabels = ["Total Students", "Selected Files"]
  constructor(
    private logger: NGXLogger,
    private _formBuilder: FormBuilder,
    private utils: UtilsService,
    private poeService: PoeService,
    private dataService: DataService,
    private httpRequestStateService: HttpRequestStateService,
    private loadingSpinnerService: LoadingSpinnerService,
    private authService: AuthService
  ) { }


  ngOnInit() {
    // this.getCentreList()
    this.selectionForm = this._formBuilder.group({
      // centre: this.centre,
      year: this.year,
      batch: this.batch,
      course: this.course,
    })
    this.getYearList()
    this.uploadForm = this._formBuilder.group({
      docType: this.docType,
      issuedTo: this.issuedTo,
      fileSelection: this.fileSelection,
      folderSelection: this.folderSelection
    })
  }


  ngOnDestroy(): void {
    this.loadingSpinnerService.closeLoading();
    this.httpRequestStateService.destroyRequest(this.uploadRequest)
    // this.httpRequestStateService.destroyRequest(this.getCentreListRequsetState)
  }


  uploadTypeChange(event) {
    this.selectedUploadGroup = event.value
    switch (this.selectedUploadGroup) {
      case 'file':
        this.isFileSplitMode = false;
        this.resetFileSelection()
        this.uploadForm.reset()
        break;
      case 'folder':
        this.isFileSplitMode = false;
        this.resetFileSelection()
        this.uploadForm.reset()
        this.issuedTo.setValue(this.rollNoList)
        break;
      default:
        this.uploadForm.reset()
    }
  }

  /**
   * triggered on file selection change
   * @param $event 
   */
  fileChange($event) {

    //converts selected files object to array (required for sorting selection)
    let fileArray: Array<any> = [].slice.call($event.target.files)

    this.setFileSelection(fileArray)
  }


  setFileSelection(fileArray) {
    
    if (this.selectedUploadGroup == 'file' && this.isFileSplitMode) {
      // allow only pdf in split mode 
      // const regex = new RegExp("([a-zA-Z0-9\s_\\.\-:])+(.pdf)$", 'i')
      const regex = new RegExp("^(?!.*(?:\\.(?:exe|sh|js|bat|zip)(?:\\.|$))).*\\.(?:pdf)$", 'i')

      fileArray = fileArray.filter(({ name }) => name.match(regex));
      if (fileArray.length < 1) {
        this.utils.showSnackBar("Please check type of file, only pdf can be uploaded in split mode")
        this.resetFileSelection()
        return
      }
    } else {
      // const regex = new RegExp("([a-zA-Z0-9\s_\\.\-:])$", 'i')
      const regex = new RegExp("^(?!.*(?:\\.(?:exe|sh|js|bat|zip)(?:\\.|$))).*\\.(?:png|pdf|jpg|jpeg)$", 'i')
      fileArray = fileArray.filter(({ name }) => name.match(regex));
      if (fileArray.length < 1) {
        this.utils.showSnackBar("Please check type of files, allwoed formats are pdf, png, jpg, jpeg, bmp")
        this.resetFileSelection()
        return
      }
    }



    this.buttonName = "Record"
    this.buttonIcon = 'cloud_upload'

    //sort files based on file names
    fileArray.sort((a, b) => {
      if (a.name < b.name) return -1;
      else if (a.name > b.name) return 1;
      else return 0;
    })
    this.selectedFiles = fileArray
    this.selectionDone = true;

    if (this.selectedUploadGroup == 'folder') {
      this.issuedTo.setValue(this.rollNoList)
      this.minimumValidMatch = (this.selectedFiles.length > this.issuedTo.value.length) ? this.issuedTo.value.length - 1 : this.selectedFiles.length - 1
      this.statValues[1] = this.selectedFiles.length
    }
    else if (this.selectedUploadGroup == 'file' && this.isFileSplitMode) {
      this.splitPdfFile()
    } else {
      this.minimumValidMatch = (this.selectedFiles.length > this.issuedTo.value.length) ? this.issuedTo.value.length - 1 : this.selectedFiles.length - 1
    }

  }


  resetFileSelection() {
    this.buttonName = 'Choose'
    this.buttonIcon = "attachment"
    this.folderSelection.reset()
    this.fileSelection.reset()
    this.selectedFiles = []
    this.selectionDone = false

    // reset roll list in folder selection
    if ((this.selectedUploadGroup == 'folder' || this.isFileSplitMode) && !this.selectionForm.invalid) {
      this.onSelectCourse()
    }
    this.isSplitingDone = false
    this.splitResult = []
    this.uploadRequest = new HttpRequestState();
    this.statValues[1] = 0
  }

  splitMode() {
    this.logger.log("splitMode : ", this.isFileSplitMode)

    if (this.isFileSplitMode) {
      this.splitResult = []
      this.uploadForm.reset()
      this.resetFileSelection()
    } else {
      this.splitResult = []
      this.uploadForm.reset()
      this.resetFileSelection()
    }
    this.onSelectCourse()
    this.issuedTo.setValue(this.rollNoList)
  }


  async splitPdfFile() {
    this.isSplitingDone = false
    this.splitResult = []
    this.splitResult = await this.poeService.getPagesFromFile(this.selectedFiles[0])
    this.isSplitingDone = true
    this.minimumValidMatch = (this.splitResult.length > this.issuedTo.value.length) ? this.issuedTo.value.length - 1 : this.splitResult.length - 1
    this.statValues[1] = this.splitResult.length
  }



  /**
   * Record transaction on blockchain
   * Request for single or multiple files are sent as single request
   * Request is Array Of Transaction to be recorded on blockchain
   */
  async recordTransaction() {

    this.uploadResponseResultArray = []


    // if mode is single file add request to array 
    if (this.selectedUploadGroup == 'file' && !this.isFileSplitMode) {
      this.uploadForm.value.issuedTo = [this.uploadForm.value.issuedTo]
    }
    else {  //set maximaum timeout if split mode or folder upload
      // this.uploadRequest.timeout = 300000 //5 mins
      this.uploadRequest.setHttpRequestStateTimeout(480000) // 8 min
      // this.loadingSpinnerService.setLoaderTimeout(360000)
    }

    // show the loading spinner dialog and initialize the request
    this.loadingSpinnerService.openLoadingDialog()
    this.httpRequestStateService.initRequest(this.uploadRequest)


    //get pages from pdf in case of split mode
    this.poeTransaction = this.isFileSplitMode ? await this.poeService.populateTransactionSplitMode(this.uploadForm.value, this.splitResult) : await this.poeService.populateTransaction(this.uploadForm.value, this.selectedFiles)


    this.uploadRequest.subscription = this.poeService.recordTransactionOnPoE(this.poeTransaction).subscribe(result => {
      this.logger.log("recordTransaction response : ", result)
      // if (result.status == const_HTTP_RESPONSE.SUCCESS) {
      if (result.length) {
        this.uploadResponseResultArray = result
        this.logger.log(result)
        this.utils.showSnackBar("Processing done, verify the result")
        this.httpRequestStateService.finishRequest(this.uploadRequest)
      } else {
        this.utils.showDialog(result.status, result.message)
        this.httpRequestStateService.finishRequestWithError(this.uploadRequest)
      }
      this.loadingSpinnerService.closeLoading()
    },
      (err: HttpErrorResponse) => {
        this.loadingSpinnerService.closeLoading()
        // this.logger.log(err.message);
        this.utils.showSnackBar("Something went wrong")
        this.httpRequestStateService.finishRequestWithError(this.uploadRequest)
      });
  }

  getResponseStatus(name) {
    var status = this.uploadResponseResultArray.find(entry => entry.fileName === name)
    return status ? status.status : "NA"
  }
  getResponseMessage(name) {
    var status = this.uploadResponseResultArray.find(entry => entry.fileName === name)
    return status ? status.message : "NA"
  }


  getYearList() {
    this.loadingSpinnerService.openLoadingDialog()
    // this.logger.log(this.selectionForm)
    var getYearListRequest = new GetYearListRequest();
    getYearListRequest.centre = this.authService.getCurrentCentre();
    this.logger.debug("getYearListRequest", getYearListRequest)
    this.dataService.getYearList(getYearListRequest).subscribe(result => {
      this.yearList = result
      this.yearList = Array.from(new Set(this.yearList.map((itemInArray) => itemInArray.year)))
      this.loadingSpinnerService.closeLoading()
    }, (error: HttpErrorResponse) => {
      this.loadingSpinnerService.closeLoading()
    })

    // this.selectionForm.get('year').reset()
    this.selectionForm.get('batch').reset()
    this.selectionForm.get('course').reset()

    this.batchList = null;
    this.courseList = null;
    this.rollNoList = null;
    this.statValues[0] = 0
  }


  onSelectYear(event) {
    this.loadingSpinnerService.openLoadingDialog()
    var getBatchListRequest = new GetBatchListRequest()
    // getBatchListRequest.centre = this.selectionForm.value.centre
    getBatchListRequest.centre = this.authService.getCurrentCentre();
    getBatchListRequest.year = this.selectionForm.value.year

    this.dataService.getBatchList(getBatchListRequest).subscribe(result => {
      this.batchList = result;
      this.batchList = Array.from(new Set(this.batchList.map((itemInArray) => itemInArray.month)))
      this.loadingSpinnerService.closeLoading()
    }, (error: HttpErrorResponse) => {
      this.loadingSpinnerService.closeLoading()
    })

    this.selectionForm.get('batch').reset()
    this.selectionForm.get('course').reset()

    this.courseList = null;
    this.rollNoList = null;
    this.statValues[0] = 0
  }

  onSelectBatch(event) {
    this.loadingSpinnerService.openLoadingDialog()
    var getCourseListRequest = new GetCourseListRequest()
    // getCourseListRequest.centre = this.selectionForm.value.centre
    getCourseListRequest.centre = this.authService.getCurrentCentre();
    getCourseListRequest.year = this.selectionForm.value.year
    getCourseListRequest.batch = this.selectionForm.value.batch
    // this.logger.log()
    this.dataService.getCourseList(getCourseListRequest).subscribe(result => {
      this.courseList = result;
      this.courseList = Array.from(new Set(this.courseList.map((itemInArray) => itemInArray.course)))
      this.loadingSpinnerService.closeLoading()
    }, (error: HttpErrorResponse) => {
      this.loadingSpinnerService.closeLoading()
    })

    this.selectionForm.get('course').reset()
    this.rollNoList = null;
    this.statValues[0] = 0
  }

  onSelectCourse() {
    var getRollNoListRequest = new GetRollNoListRequest()
    // getRollNoListRequest.centre = this.selectionForm.value.centre
    getRollNoListRequest.centre = this.authService.getCurrentCentre();
    getRollNoListRequest.year = this.selectionForm.value.year
    getRollNoListRequest.batch = this.selectionForm.value.batch
    getRollNoListRequest.course = this.selectionForm.value.course

    this.dataService.getRollNoList(getRollNoListRequest).subscribe(result => {
      this.rollNoList = result;
      this.rollNoList = Array.from(new Set(this.rollNoList.map((itemInArray) => itemInArray.rollNo)))
      this.rollNoList.sort()
      if (this.selectedUploadGroup == 'folder' || this.isFileSplitMode) {
        this.issuedTo.setValue(this.rollNoList)
        this.statValues[0] = this.issuedTo.value.length
      } else {
        this.statValues[0] = this.rollNoList.length
      }
      this.minimumValidMatch = (this.selectedFiles.length > this.issuedTo.value.length) ? this.issuedTo.value.length - 1 : this.selectedFiles.length - 1



    })


  }


  getSelectionValidationMessage() {
    // if (this.centre.hasError('required'))
    //   return 'You must select centre first'
    if (this.year.hasError('required'))
      return 'You must select year first'
    else if (this.batch.hasError('required'))
      return 'You must select batch first'
    else if (this.course.hasError('required'))
      return 'You must select course first'
    else if (this.issuedTo.hasError('required'))
      return 'You must select roll no'
    else
      return ''
  }


  dropFile(event: CdkDragDrop<string[]>) {

    if (this.isFileSplitMode) {
      moveItemInArray(this.splitResult, event.previousIndex, event.currentIndex);
    } else {
      moveItemInArray(this.selectedFiles, event.previousIndex, event.currentIndex);
    }
  }

  deleteCertificate(index) {

    if (this.isFileSplitMode) {
      this.splitResult.splice(index, 1)
      if (this.splitResult.length == 0) {
        this.resetFileSelection()
      }
      this.minimumValidMatch = (this.splitResult.length > this.issuedTo.value.length) ? this.issuedTo.value.length - 1 : this.splitResult.length - 1
      this.statValues[1] = this.splitResult.length
    }
    else {
      this.selectedFiles.splice(index, 1)
      if (this.selectedFiles.length == 0) {
        this.resetFileSelection()
      }
      this.minimumValidMatch = (this.selectedFiles.length > this.issuedTo.value.length) ? this.issuedTo.value.length - 1 : this.selectedFiles.length - 1
      this.statValues[1] = this.selectedFiles.length
    }
  }

  deleteRollno(index) {
    this.issuedTo.value.splice(index, 1)
    if (this.issuedTo.value.length == 0) {
      this.resetFileSelection()
    }
    if (this.isFileSplitMode) {
      this.minimumValidMatch = (this.splitResult.length > this.issuedTo.value.length) ? this.issuedTo.value.length - 1 : this.splitResult.length - 1
    } else {
      this.minimumValidMatch = (this.selectedFiles.length > this.issuedTo.value.length) ? this.issuedTo.value.length - 1 : this.selectedFiles.length - 1
    }
    this.statValues[0] = this.issuedTo.value.length
  }
}