import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as kuja from "kjua";
import * as jspdf from 'jspdf';
import 'jspdf-autotable';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { PoETransaction } from 'src/app/shared/models/poetransaction';
import { NGXLogger } from 'ngx-logger';
import * as CryptoJS from 'crypto-js';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { PoETransactionOrg } from 'src/app/shared/models/poetransactionorg';

@Injectable({
  providedIn: 'root'
})
export class PoeService {
  poeList = '';
  poeListSpecificUser = '';
  recordTransactionUrl = ''
  recordTransactionOrgUrl = ''
  searchByHashUrl = ''
  searchByTxIdUrl = ''
  searchByTxIdUrlOrg = ''
  searchByHashUrlOrg = ''
  getPosFileUrl = ''
  getTransactionDetailsUrl = ''
  downloadFileFromServer = ''
  activateUserUrl = ''
  activateOrgUserUrl = ''

  constructor(
    private http: HttpClient,
    private utils: UtilsService,
    private logger: NGXLogger,
    private authService: AuthService
  ) {
    this.poeList = environment.apiEndpoint + '/poe/bct/transactions';
    this.poeListSpecificUser = environment.apiEndpoint + "/genpoe/user/docs"
    this.recordTransactionUrl = environment.apiEndpoint + "/poe/bct/transactions"
    this.searchByHashUrl = environment.apiEndpoint + "/poe/bct/transactions/fileHash"
    this.searchByTxIdUrl = environment.apiEndpoint + "/poe/bct/transactions/TxId"
    this.getPosFileUrl = environment.apiEndpoint + "/poepos/file"
    this.getTransactionDetailsUrl = environment.apiEndpoint + "/poe/query"
    this.downloadFileFromServer = environment.apiEndpoint + "/getpdfreceipt"
    this.activateUserUrl = environment.apiEndpoint + "/user/verify"
    this.activateOrgUserUrl = environment.apiEndpoint + "/org/verify"
    // this.recordTransactionOrgUrl = environment.apiEndpoint + "/poe/bct/generic/transactions"
    this.recordTransactionOrgUrl = environment.apiEndpoint + "/genericinvoke"
    this.searchByTxIdUrlOrg = environment.apiEndpoint + "/poe/bct/generic/transactions/TxId"
    this.searchByHashUrlOrg = environment.apiEndpoint + "/poe/bct/generic/transactions/fileHash"
  }

  public getPoeList() {
    return this.http.get(this.poeList);
  }

  public getPoeListSpecificUser(getPoeListRequest) {
    this.logger.log("getPoeListSpecificUser request", getPoeListRequest)
    return this.http.post<any>(this.poeListSpecificUser, getPoeListRequest);
  }


  searchByHash(key) {
    this.logger.log("searchByHash searching", key)
    return this.http.post<any>(this.searchByHashUrl, { sha256Hash: key });
  }

  searchByTxId(key) {
    this.logger.log("searchByTxId searching", key)
    return this.http.post<any>(this.searchByTxIdUrl, { txId: key });
  }
  searchByTxIdOrg(key) {
    this.logger.log("searchByTxIdOrg searching", key)
    return this.http.post<any>(this.searchByTxIdUrlOrg, { txId: key });
  }

  searchByHashOrg(key) {
    this.logger.log("searchByTxIdOrg searching", key)
    return this.http.post<any>(this.searchByHashUrlOrg, { sha256Hash: key });
  }
  getPosFile(value) {
    let params = new HttpParams().set("hash", value)
    return this.http.get(this.getPosFileUrl, { params: params })
  }

  recordTransactionOnPoE(txn) {
    this.logger.log("recordTransactionOnPoE", txn)
    return this.http.post<any>(this.recordTransactionUrl, txn);
  }
  recordTransactionOnPoEOrg(txn) {
    this.logger.log("recordTransactionOnPoEOrg", txn)
    return this.http.post<any>(this.recordTransactionOrgUrl, txn);
  }

  getTransactionDetails(value) {
    let params = new HttpParams().set("txId", value)
    return this.http.get(this.getTransactionDetailsUrl, { params: params })
  }



  public populateTransaction(formValue, selectedFiles, isFileUpload, isSendMail) {
    console.log(formValue, selectedFiles)
    let poeTxnArray = []
    var i = 0
    return new Promise(resolve => {


      for (let index = 0; index < formValue.length; index++) {

        (async (selectedFileFromArray, index) => {
          console.log(" start txn", i, index, selectedFileFromArray)
          // console.log(selectedFileFromArray)

          const reader = new FileReader();
          // const readerForBase64 = new FileReader();
          let poeTransaction

          if (this.authService.isRolePoeUser()) {
            let txn: PoETransaction = new PoETransaction()
            poeTransaction = txn
          } else {
            let txn: PoETransactionOrg = new PoETransactionOrg()
            poeTransaction = txn
          }


          if (isFileUpload) {
            poeTransaction.base64 =  await this.getFileAsBase64(selectedFileFromArray)
            reader.readAsArrayBuffer(selectedFileFromArray);
          } else {
            reader.readAsArrayBuffer(selectedFileFromArray);
          }

          reader.onload = file => {

            const barray = this.arrayBufferToWordArray(reader.result);
            const hash1 = CryptoJS.SHA1(barray).toString(CryptoJS.enc.Hex);
            const hash256 = CryptoJS.SHA256(barray).toString(CryptoJS.enc.Hex);

            poeTransaction.sha1Hash = hash1
            poeTransaction.sha256Hash = hash256
            poeTransaction.allowStorage = isFileUpload ? "true" : "false"
            poeTransaction.sendMail = isSendMail;

            
            poeTransaction.fileSize = this.utils.formatBytes(selectedFileFromArray.size);
            poeTransaction.fileType = selectedFileFromArray.type;
            poeTransaction.documentType = formValue[index].docType;
            


            //based on who is recording transaction 
            if (this.authService.isRolePoeUser()) {
              // poeTransaction.fileName = selectedFileFromArray.name;
              poeTransaction.fileName = formValue[index].docType;
              poeTransaction.issuedTo = this.authService.getCurrentUser();
            } else {
              poeTransaction.fileName = selectedFileFromArray.name;
              poeTransaction.uniqueID = formValue[index].uniqueID;
              poeTransaction.recipientEmail = formValue[index].issuedToEmail;
              poeTransaction.recipientName = formValue[index].issuedToName;
              poeTransaction.recipientMobile = formValue[index].issuedToPhone;
            }

            i++
            console.log("txn end ", i, poeTransaction)
            poeTxnArray[index] = poeTransaction

            // return when all processed
            if (i == selectedFiles.length) {
              resolve(poeTxnArray)
              // this.logger.debug("resolved", poeTransaction)
              // resolve(poeTransaction)
            }
          }
        })(selectedFiles[index], index)
      }
    })
  }

  /**
    * Calculates base64 
    */
  async getFileAsBase64(selectedFileFromArray) {
    return new Promise((resolve, reject) => {
      const readerForBase64 = new FileReader();
      readerForBase64.onload = file => {
        // console.log(file)
        var arrayBuffer = readerForBase64.result;
        var arrayBufferString = arrayBuffer.toString()
        resolve(arrayBufferString)
        // var base64str = arrayBufferString.substr(arrayBufferString.indexOf(',') + 1).toString()
        // poeTransaction.base64 = arrayBufferString;
        // reader.readAsArrayBuffer(selectedFileFromArray);
      };
      readerForBase64.readAsDataURL(selectedFileFromArray);
    })
  }

  /**
   * Calculates hash 
   */
  async getFileArtifacts() {
    return new Promise((resolve, reject) => {

    })
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

  public downloadReceipt(poedetail) {

    var coulmns = [
      ['Transaction ID', poedetail.txId]
    ]

    var rows = [
      ['File Name', poedetail.fileName],
      // ['File Type', poedetail.fileType],
      ['Document Type', poedetail.documentType],
      ['SHA256 Hash', poedetail.sha256Hash],
      ['User', poedetail.issuedTo],
      ['Status', poedetail.txstatus],
      ['Timestamp', poedetail.timestamp],
    ]

    this.generatePDF(
      "Receipt",
      "PoE Record Details",
      environment.uiEndpoint + "transaction/" + poedetail.txId,
      poedetail.txId,
      coulmns,
      rows,
      this.utils.logos.poeLogo
    )
  }

  /**
   * generate reciept pdf for poe transaction
   * @param title 
   * @param subtitle 
   * @param qrcodeData 
   * @param fileName 
   * @param pdfContentColumnArray 
   * @param pdfContentRowArray 
   * @param logoInBase64 
   */
  public generatePDF(title, subtitle, qrcodeData, fileName, pdfContentColumnArray, pdfContentRowArray, logoInBase64) {

    const qrCodeData = this.getQRCodeData(qrcodeData);
    const pdf = new jspdf('v', 'mm', 'a4');
    var pageWidth = pdf.internal.pageSize.width || pdf.internal.pageSize.getWidth();
    var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();

    // logos
    pdf.addImage(logoInBase64, 'png', 15, 10, 26, 26)
    pdf.addImage(this.utils.logos.cdacLogo, 'JPG', pageWidth - 44, 13, 27, 20)

    // header
    pdf.setFontSize(20);
    pdf.text(pageWidth - (pageWidth / 2), 21, title, 'center');
    pdf.setFontSize(14);
    pdf.setTextColor('#2E8B57');
    pdf.text(pageWidth - (pageWidth / 2), 28, subtitle, 'center');
    pdf.line(14, 40, pageWidth - 14, 40);

    //table data -----------------------------
    pdf.autoTable({
      head: pdfContentColumnArray,
      body: pdfContentRowArray,
      margin: { top: 44 }
    });

    // qrcode
    pdf.addImage(qrCodeData, 'JPG', pageWidth - 40, pageHeight - 52, 28, 28)

    // qrdata url
    pdf.setFontSize(11);
    pdf.setTextColor('#FF00CC');
    var splitTitle = pdf.splitTextToSize(qrcodeData, 128);
    pdf.text(16, pageHeight - 34, splitTitle, 'left');
    pdf.setFontStyle('italic')

    // instruction
    pdf.setFontSize(10);
    pdf.setTextColor('#2E8B57');
    pdf.text(16, pageHeight - 44, "Scan QR-Code or visit following url to verify authenticity of this document.", 'left');
    pdf.text(16, pageHeight - 40, "This document is computer generated and hence does not require signature.", 'left');

    // footer
    pdf.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20);
    pdf.setFontStyle('normal')
    pdf.text(pageWidth - (pageWidth / 2), pageHeight - 8, '© Centre for Development of Advanced Computing, Hyderabad', 'center');
    pdf.save(fileName + '.pdf');
  }


  /**
   * retrive qr code for given input text
   * @param text 
   */
  public getQRCodeData(text: string) {
    return kuja({
      render: "canvas",
      crisp: true,
      minVersion: 1,
      ecLevel: "Q",
      size: 900,
      ratio: undefined,
      fill: "#333",
      back: "#fff",
      text,
      rounded: 10,
      quiet: 2,
      mode: "label",
      mSize: 5,
      mPosX: 50,
      mPosY: 100,
      label: '',
      fontname: "sans-serif",
      fontcolor: "#3F51B5",
      image: ''
    });
  }


  public downloadReceiptFromServer(txId) {
    this.logger.log("download file", txId)
    return this.http.post(this.downloadFileFromServer, { txId: txId },
      //  { observe: 'response', responseType: 'blob' }
    );
  }

  public activateUser(token, isOrg) {
    this.logger.log("activate user", token)
    return this.http.post<any>(isOrg ? this.activateOrgUserUrl : this.activateUserUrl, { token: token });
  }
}
