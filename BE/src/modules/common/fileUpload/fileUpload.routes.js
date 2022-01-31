require("dotenv/config");
const auth = require("../../../middleware/auth");
const router = require("express").Router();
const Upload = require("../../common/fileUpload/fileUpload.model");
const AWS = require("aws-sdk");
const multer = require("multer");
const uuid = require("uuid/v4");
const fs = require("fs");

var s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY,
  region: "us-east-2",
});

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});

const uploads = multer({ storage }).single("media");

router.post("/upload", uploads, async (req, res) => {
  console.log("-----------");
  console.log("file upload started. file name : " + req.file.originalname);
  let myFile = req.file.originalname.split(".");
  const fileType = myFile[myFile.length - 1];

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${req.file.originalname}.${uuid()}.${fileType}`,
    Body: req.file.buffer,
  };

  const result = await s3
    .upload(params, (error, data) => {
      if (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    })
    .promise();
  const upload = new Upload({
    upload: { link: result.Location, ETag: result.ETag },
  });
  const saveUpload = await upload.save();
  
  console.log("file upload ended.");
  console.log(saveUpload);
  console.log("-----------");

  res
    .status(200)
    .send({ Message: "Upload Successfully..", upload: saveUpload });
});

router.post("/delete", async (req, res) => {
  var link = req.body.link;
  var file = link.split('/')[3];
  console.log("-----------");
  console.log("file delete started. file name : " + file);
  s3.deleteObject({ 
    Bucket: process.env.AWS_BUCKET_NAME, 
    Key: file, 
  }, (err, data) => {
    if(err){
      console.log(err);
      return res.status(500).send(err);
    }
  });
  var result = await Upload.findOneAndDelete({
    'upload.link': link
  });
  console.log(result);
  console.log("file delete ended.");
  console.log("-----------");
  
  res
    .status(200)
    .send({ Message: "Deleted Successfully.."});
});

router.get("/videoStreaming/:file", function (req, res) {
  const file = req.params.file;
  console.log(file);  
  var s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY,
    region: "us-east-2",
  });
  const mimetype = 'video/mp4';
  const cache = 0;
  console.log('const mimetype, file, and cache declared');
  s3.listObjectsV2({Bucket: "cca-fileupload", MaxKeys: 1, Prefix: file}, function(err, data) {
    if (err) {
      console.log(err);
      return res.sendStatus(404);
    }
    console.log('made request to s3 to list objects');

    if ((req != null) && (req.headers.range != null)) {
      var range = req.headers.range;
      var bytes = range.replace(/bytes=/, '').split('-');
      var start = parseInt(bytes[0], 10);
      var total = data.Contents[0].Size;
      var end = bytes[1] ? parseInt(bytes[1], 10) : total - 1;
      var chunksize = (end - start) + 1;
      console.log('declared range, bytes, start, total, end, chunksize vars');

      res.writeHead(206, {
          'Content-Range'  : 'bytes ' + start + '-' + end + '/' + total,
          'Accept-Ranges'  : 'bytes',
          'Content-Length' : chunksize,
          'Last-Modified'  : data.Contents[0].LastModified,
          'Content-Type'   : mimetype
      });
      console.log('wrote header');
      s3.getObject({Bucket: "cca-fileupload", Key: file, Range: range}).createReadStream().pipe(res);
      console.log('got object from s3 and created readstream');
    }
    else
    {
      res.writeHead(200,
      {
          'Cache-Control' : 'max-age=' + cache + ', private',
          'Content-Length': data.Contents[0].Size,
          'Last-Modified' : data.Contents[0].LastModified,
          'Content-Type'  : mimetype
      });
      s3.getObject({Bucket: "cca-fileupload", Key: file}).createReadStream().pipe(res);
      console.log('fell into else statement, wrote header');
    }
  });
});

module.exports = router;

/**
 * How to solve access denied error when calling listObjectV2 ???
 * 
 * I've added some s3 policies to the permission of the bucket named "cca-fileupload"
 {
    "Version": "2012-10-17",
    "Id": "Policy1636098771860",
    "Statement": [
        {
            "Sid": "Stmt1636098770373",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:*",
            "Resource": "arn:aws:s3:::cca-fileupload/*"
        },
        //----------- NEW PERMISSIONS -----------
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::cca-fileupload/*"
        },
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:ListBucket",
            "Resource": "arn:aws:s3:::cca-fileupload"
        }
    ]
  }
 */
