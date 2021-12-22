

function generatepdf(txId,fileName,fileType,documentType,sha256Hash,sha1Hash,issuedTo,issuedByUser,issuedByOrg,timestamp,bheight,res){
    // Create a document
    const doc = new PDFDocument;
    var title = "PoE Receipt";
    // Pipe its output somewhere, like to a file or HTTP response
    // See below for browser usage
    doc.pipe(fs.createWriteStream("/tmp/PoEReceipt_"+txId+".pdf"));
    
    // Embed a font, set the font size, and render some text
    /*doc.font('fonts/PalatinoBold.ttf')
       .fontSize(25)
       .text('Some text with an embedded font!', 100, 100);
    */
    // Add an image, constrain it to a given size, and center it vertically and horizontally
    
    var pageWidth = doc.page.width;
    var pageHeight = doc.page.height;
    console.log(pageWidth)
      //  var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    // Add another page
    
       /* .fontSize(15)
       .text( subtitle,pageWidth - (pageWidth / 2),140); */
       //doc.line(14, 40, pageWidth - 14, 40);
    doc.image('/home/cdac/Downloads/cdac.jpeg', pageWidth-100, 25, {fit: [100, 100], align: 'left', valign: 'top'});
    doc.fontSize(30)
       .fillColor("blue")
       .text(title, 250, 135);
    
    doc.fontSize(10)
    .fillColor("black")
    .text("Transaction Id",150,200)   
    .text(txId, 300, 200);
    
    doc.fontSize(10)
    .fillColor("black")
    .text("FileName",150,230)
    .text(fileName, 300, 230)
    
    doc.fontSize(10)
    .fillColor("black")
    .text("FileType",150,260)
    .text(fileType, 300, 260)
    
    doc.fontSize(10)
    .fillColor("black")
    .text("documentType",150,290)
    .text(documentType, 300, 290);
    
    doc.fontSize(10)
    .fillColor("black")
    .text("sha256Hash",150,320)
    .text(sha256Hash, 300, 320);
    
    doc.fontSize(10)
    .fillColor("black")
    .text("sha1Hash",150,350)
    .text(sha1Hash, 300, 350);
    
    doc.fontSize(10)
    .fillColor("black")
    .text("issuedTo",150,380)
    .text(issuedTo, 300, 380);

    doc.fontSize(10)
    .fillColor("black")
    .text("issuedByUser",150,420)
    .text(issuedByUser, 300, 420);

    doc.fontSize(10)
    .fillColor("black")
    .text("issuedByOrg",150,450)
    .text(issuedByOrg, 300, 450);

     doc.fontSize(10)
    .fillColor("black")
    .text("heigth of block",150,480)
    .text(bheight, 300, 480); 
    
    doc.fontSize(10)
    .fillColor('#2E8B57')
    .text("http://cdacchain.in",100,pageHeight-120)
    .text( "Scan QR-Code or visit above url to verify authenticity of this document.", 100,pageHeight-100)
    .text( "This document is computer generated and hence does not require signature.", 100,pageHeight-90);
    doc.image('/home/cdac/Downloads/qrcode.png', pageWidth-100, pageHeight-100, {fit: [100, 100], align: 'left', valign: 'bottom'})
    /* var stream = doc.pipe(base64.encode());
    
    stream.on('data', function(chunk) {
        finalString += chunk;
    });
    
    stream.on('end', function() {
        // the stream is at its end, so push the resulting base64 string to the response
        var backToPDF  = new Buffer(finalString, 'base64');
        read.writeFileSync('./output.pdf', backToPDF);
    }); */
    
    // Draw a triangle
    /* doc.save()
       .moveTo(100, 150)
       .lineTo(100, 250)
       .lineTo(200, 250)
       .fill("#FF3300"); */
    
    // Apply some transforms and render an SVG path with the 'even-odd' fill rule
    /* doc.scale(0.6)
       .translate(470, -380)
       .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
       .fill('red', 'even-odd')
       .restore(); */
    
    // Add some text with annotations
    /* doc.addPage()
       .fillColor("blue")
       .text('Here is a link!', 100, 100)
       .underline(100, 100, 160, 27, {color: "#0000FF"})
       .link(100, 100, 160, 27, 'http://google.com/'); */
    
    // Finalize PDF file
    doc.end();
    //var data =fs.readFileSync("PoEReceipt_"+txId+".pdf");
   // res.contentType("application/pdf");                
   // res.send(data);
   //res.download("PoEReceipt_"+txId+".pdf");
   /* var file = fs.createReadStream("PoEReceipt_"+txId+".pdf");
var stat = fs.statSync("PoEReceipt_"+txId+".pdf");
res.setHeader('Content-Length', stat.size);
res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');
file.pipe(res); */
var files = [{
    path: 'PoEReceipt_' + txId + '.pdf',
    name: 'PoEReceipt.pdf'
}
] 
               //  res.zip(files);
};