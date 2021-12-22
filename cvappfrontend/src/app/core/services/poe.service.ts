import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { UtilsService } from './utils.service';
import { PoETransaction } from 'src/app/shared/models/poetransaction';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Base64File } from 'src/app/shared/models/base64file';
import { Observable, of } from 'rxjs';
import { PDFDocumentFactory, PDFDocumentWriter, StandardFonts, drawText } from 'pdf-lib';
import { NGXLogger } from 'ngx-logger';

class PdfInBytes {
  page: any;
  name: string;
}
@Injectable({
  providedIn: 'root'
})
export class PoeService {
  // poeTransaction: PoETransaction;
  base64File: Base64File;
  recordTransactionUrl = ''
  uploadBase64FileUrl = ''
  searchByHashUrl = ''
  searchByTxIdUrl = ''
  searchByRollNoUrl = ''
  getTransactionDetailsUrl = ''
  getPosFileUrl = ''
  constructor(
    private logger: NGXLogger,
    private utils: UtilsService,
    private http: HttpClient
  ) {
    // this.poeTransaction = new PoETransaction()
    this.base64File = new Base64File()
    this.recordTransactionUrl = environment.apiEndpoint + "/poe/transactions"
    this.uploadBase64FileUrl = environment.apiEndpoint + "/insertuserdetails"
    this.searchByHashUrl = environment.apiEndpoint + "/poe/transactions/fileHash"
    this.searchByTxIdUrl = environment.apiEndpoint + "/poe/transactions/TxId"
    this.searchByRollNoUrl = environment.apiEndpoint + "/poe/transactions/rollNo"
    this.getTransactionDetailsUrl = environment.apiEndpoint + "/poe/query"
    this.getPosFileUrl = environment.apiEndpoint + "/poepos/file"
  }

  readFile(files) {
    const fileReader = new FileReader()
    fileReader.onprogress = progress => {
      // this.uploadProgress = Math.floor((progress.loaded / progress.total) * 100)
    }
    // fileReader.onload = file => { }
    fileReader.onloadstart = file => {
      // this.uploadProgress = 0;
      // this.isFileUploaded = false
    }
    fileReader.onloadend = file => {
      // this.isFileUploaded = true
    }
    fileReader.readAsArrayBuffer(files)
  }

  public populateTransaction_old(readResult) {
    const barray = this.arrayBufferToWordArray(readResult);
    const hash1 = CryptoJS.SHA1(barray).toString(CryptoJS.enc.Hex);
  }

  public calculateSHA256(fileName, poeTransaction) {
    if (!fileName) {
      return;
    }
    const reader = new FileReader();
    reader.onload = file => {
      const barray = this.arrayBufferToWordArray(reader.result);
      const hash256 = CryptoJS.SHA256(barray).toString(CryptoJS.enc.Hex);
      poeTransaction.sha256Hash = hash256;
      return hash256
      // this.logger.log('SHA256: ' + hash);
    };
    reader.readAsArrayBuffer(fileName);
  }

  public calculateSHA1(fileName, poeTransaction) {
    if (!fileName) {
      return;
    }
    const reader = new FileReader();
    reader.onload = file => {
      const barray = this.arrayBufferToWordArray(reader.result);
      const hash1 = CryptoJS.SHA1(barray).toString(CryptoJS.enc.Hex);
      poeTransaction.sha1Hash = hash1;
      return hash1;
      // this.logger.log('SHA1: ' + hash);
    };
    reader.readAsArrayBuffer(fileName);
  }

  public calculateBase64(fileName, poeTransaction) {
    if (!fileName) {
      return;
    }
    const reader = new FileReader();
    reader.onload = file => {
      var arrayBuffer = reader.result;
      var arrayBufferString = arrayBuffer.toString()
      var base64str = arrayBufferString.substr(arrayBufferString.indexOf(',') + 1).toString()

      poeTransaction.base64 = base64str;
      // return base64str
    };
    reader.readAsDataURL(fileName);
  }

  public arrayBufferToWordArray(ab) {
    const i8a = new Uint8Array(ab);
    const a = [];
    let i: number;
    for (i = 0; i < i8a.length; i += 4) {
      a.push(i8a[i] << 24 | i8a[i + 1] << 16 | i8a[i + 2] << 8 | i8a[i + 3]);
    }
    return CryptoJS.lib.WordArray.create(a);
    // return CryptoJS.lib.WordArray.create(a, i8a.length);
  }

  // populateTransactionOld(formValue, selectedFile) {
  //   var poeTransaction = new PoETransaction()
  //   this.logger.log(selectedFile)
  //   this.logger.log(formValue)
  //   this.calculateSHA256(selectedFile, poeTransaction);
  //   this.calculateSHA1(selectedFile, poeTransaction);
  //   this.calculateBase64(selectedFile, poeTransaction);
  //   poeTransaction.documentType = formValue.docTypeSingle;
  //   poeTransaction.issuedTo = formValue.issuedToSingle;

  //   poeTransaction.fileName = selectedFile.name;
  //   poeTransaction.fileSize = this.utils.formatBytes(selectedFile.size);
  //   poeTransaction.fileType = selectedFile.type;
  //   let poeTxnArray = []
  //   poeTxnArray.push(poeTransaction)
  //   return poeTxnArray
  // }

  public populateTransaction(formValue, selectedFiles) {

    var obs = new Observable
    let poeTxnArray = []
    var finalArray = []
    var i = 0
    var minimum = formValue.issuedTo.length < selectedFiles.length ? formValue.issuedTo.length : selectedFiles.length
    return new Promise(resolve => {


      for (let index = 0; index < minimum; index++) {
        (selectedFileFromArray => {


          const reader = new FileReader();
          const readerForBase64 = new FileReader();
          var poeTransaction = new PoETransaction()




          readerForBase64.onload = file => {
            var arrayBuffer = readerForBase64.result;
            var arrayBufferString = arrayBuffer.toString()
            // var base64str = arrayBufferString.substr(arrayBufferString.indexOf(',') + 1).toString()
            poeTransaction.base64 = arrayBufferString;
            reader.readAsArrayBuffer(selectedFileFromArray);
          };
          readerForBase64.readAsDataURL(selectedFileFromArray);

          reader.onload = file => {
            const barray = this.arrayBufferToWordArray(reader.result);
            const hash1 = CryptoJS.SHA1(barray).toString(CryptoJS.enc.Hex);
            const hash256 = CryptoJS.SHA256(barray).toString(CryptoJS.enc.Hex);

            poeTransaction.sha1Hash = hash1
            poeTransaction.sha256Hash = hash256

            poeTransaction.documentType = formValue.docType;
            poeTransaction.issuedTo = formValue.issuedTo[index];

            poeTransaction.fileName = selectedFileFromArray.name;
            poeTransaction.fileSize = this.utils.formatBytes(selectedFileFromArray.size);
            poeTransaction.fileType = selectedFileFromArray.type;

            i++
            poeTxnArray.push(poeTransaction)

            // return when all processed
            if (i == minimum) {
              resolve(poeTxnArray)
            }
          }

        })(selectedFiles[index])

      }


    })
  }


  /**
   * return array of pages from given pdf
   * @param file 
   */
  public getPagesFromFile(file) {
    
    var i = 0
    var pagesInBytesArray = []

    return new Promise(resolve => {
      var reader = new FileReader()
      reader.onload = result => {
        if (reader.result instanceof ArrayBuffer) {
          var uint8View = new Uint8Array(reader.result as ArrayBuffer).subarray(0, reader.result.byteLength);
        }
        const pdfDoc = PDFDocumentFactory.load(uint8View);
        const pages = pdfDoc.getPages();


        pages.forEach(page => {
          i++;
          var pageInBytes = new PdfInBytes()
          pageInBytes.page = page;
          pageInBytes.name = file.name.slice(0, -4) + "_Page_" + i + ".pdf";
          pagesInBytesArray.push(pageInBytes)
          if (i == pages.length) {
            resolve(pagesInBytesArray)
          }
        });

      }
      reader.readAsArrayBuffer(file)
    })
  }

  public populateTransactionSplitMode(formValue, selectedPages) {

    this.logger.log("populateTransactionSplitMode : ",formValue)

    var obs = new Observable
    this.logger.log("selectedPages", selectedPages)
    let poeTxnArray = []
    var finalArray = []
    var i = 0
    return new Promise(resolve => {

      const readerForBase64 = new FileReader();

      var minimum = formValue.issuedTo.length < selectedPages.length ? formValue.issuedTo.length : selectedPages.length
      for (let pageIndex = 0; pageIndex < minimum; pageIndex++) {
        (pageFromFile => {

          var poeTransaction = new PoETransaction()
          var readerForBase64: FileReader = new FileReader();
          readerForBase64.onload = o => {
            i++;
            // this.logger.log(readerForBase64)
            var arrayBuffer = readerForBase64.result;
            var arrayBufferString = arrayBuffer.toString()
            // var base64str = arrayBufferString.substr(arrayBufferString.indexOf(',') + 1).toString()
            poeTransaction.base64 = arrayBufferString;
            poeTxnArray.push(poeTransaction)
            if (i == minimum) {
              resolve(poeTxnArray)
            }
          }

          var newPage = PDFDocumentFactory.create()
          newPage.addPage(pageFromFile.page);
          var pageInBytes = PDFDocumentWriter.saveToBytes(newPage)
          const barray = this.arrayBufferToWordArray(pageInBytes);
          const hash1 = CryptoJS.SHA1(barray).toString(CryptoJS.enc.Hex);
          const hash256 = CryptoJS.SHA256(barray).toString(CryptoJS.enc.Hex);
          poeTransaction.sha1Hash = hash1
          poeTransaction.sha256Hash = hash256
          poeTransaction.documentType = formValue.docType;
          poeTransaction.issuedTo = formValue.issuedTo[pageIndex];

          poeTransaction.fileName = pageFromFile.name.slice(0, -4) + ".pdf";
          poeTransaction.fileSize = this.utils.formatBytes(pageInBytes.byteLength);
          poeTransaction.fileType = "application/pdf"

          readerForBase64.readAsDataURL(new Blob([new Uint8Array(pageInBytes)]));
        })(selectedPages[pageIndex])
      }
    })
  }

  generateBase64(formValue, selectedFile) {
    this.calculateBase64(selectedFile, this.base64File);
    this.base64File.fileName = selectedFile.name;
    this.base64File.fileSize = this.utils.formatBytes(selectedFile.size);
    this.base64File.fileType = selectedFile.type;
    return this.base64File
  }

  recordTransactionOnPoE(txn) {
    this.logger.log("recordTransactionOnPoE",txn)
    return this.http.post<any>(this.recordTransactionUrl, txn);
  }

  uploadBase64File(file) {
    return this.http.post<any>(this.uploadBase64FileUrl, file);
  }

  searchByHash(key) {
    this.logger.log("searchByHash searching", key)
    return this.http.post<any>(this.searchByHashUrl, { sha256Hash: key });
  }

  searchByTxId(key) {
    this.logger.log("searchByTxId searching", key)
    return this.http.post<any>(this.searchByTxIdUrl, { txId: key });
  }

  searchByRollNo(key) {
    this.logger.log("searchByRollNo searching", key)
    return this.http.post<any>(this.searchByRollNoUrl, { rollNo: key });
  }

  getTransactionDetails(value) {
    let params = new HttpParams().set("txId", value)
    return this.http.get(this.getTransactionDetailsUrl, { params: params })
  }

  getPosFile(value) {
    let params = new HttpParams().set("hash", value)
    return this.http.get(this.getPosFileUrl, { params: params })
  }
}