const puppeteer = require("puppeteer");
const express = require("express");
const app = express();
const fs = require('fs');

app.set("view engine", "ejs");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header(
    "ACCESS-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type,Accept"
  );
  next();
});

async function getAutoData() {
  
  // const browser = await puppeteer.launch(
  //   {   args: ['--disable-features=site-per-process']}
  // );

  // For Heroku Deployment
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox']
  })


  totalData = 965;

  jsonDatabase = require('./data/database.json');
  console.log("Scraping City Number : "+jsonDatabase.length +" of "+ totalData);


for (let index = jsonDatabase.length; index <= totalData; index++) {
 

  const page = await browser.newPage();
  await page.goto("https://www.rssdi.in/memberselfarea/login.php");

  await page.waitFor(2000);

  await page.$eval('input[name=username]', el => el.value = 'bhaskar.jha@usv.in');
  await page.$eval('input[name=username1]', el => el.value = 'Bhaskar');
  // await page.screenshot({'path': 'data/' + index + 'screen.png'})

  await page.click('button[type="submit"]');
  await page.waitFor(2000);
  await page.goto('https://www.rssdi.in/newwebsite/member-gps.php', { waitUntil: 'networkidle0' });
  await page.waitFor(2000);


  await page.click("#first");
  await page.keyboard.press('Tab'); 
  // await page.screenshot({'path':  'data/'  + index + 'screen2.png'})

  await page.keyboard.press('Enter'); 
  // await page.screenshot({'path':  'data/'  + index + 'screen3.png'})

  for (let index2 = 0; index2 < jsonDatabase.length; index2++) {
  await page.keyboard.press('ArrowDown');
  }


  // await page.screenshot({'path': 'data/'  + index +  'screen4.png'})

  await page.keyboard.press('Enter'); 
  await page.keyboard.press('Tab'); 

  await page.keyboard.press('Enter'); 


  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  
  await page.waitFor(2000);
  await page.screenshot({'path': 'data/screen_'  + index +  '.png'})

  // await page.waitFor(2000);

  var frames = (await page.frames());
  let frameTitle0 = await frames[0].title();
  let frameTitle1 = await frames[1].title();
  let frameTitle2 = await frames[2].title();
  console.log(frameTitle0);
  console.log(frameTitle1);
  console.log(frameTitle2);




 
    let selectedFrame = await frames[1];

    result = await selectedFrame.evaluate(() => {

    const data = document.querySelector('*').outerHTML;

    // const formHTML = document.getElementsByTagName('form').innerHTML;

    var formHTMLData = data;
    console.log(formHTMLData);

    var citypos1 = formHTMLData.search("title=");
    var citypos2 = formHTMLData.search("</span>");
    let cityName = formHTMLData.slice(citypos1+7,citypos2);

    var citypos3 = cityName.search('">');
    cityName = cityName.slice(0, citypos3)
    console.log(cityName);

    
    var dataSet = [];

    var strData = data;
    var activityData = data;
    console.log("Scripts Targetted");

    console.log(activityData);
    console.log(strData);

    // Data Operation
    if(strData.length > 0){
    console.log("Marker Targetted");

    var targetPoint = 1;
    var marker_pos = strData.search("var marker_"+targetPoint);
    var contentStrData = strData;
    var content_pos = strData.search("var contentString_"+targetPoint);

    for (let i = 2; i < 99999; i++) {
      
      if(marker_pos != -1){
        var firstCut = strData.slice(marker_pos,marker_pos+200)
        var finalCutPos = firstCut.search(";")
        firstCut.slice(0,finalCutPos);
        console.log("Marker "+ i + " Final Data :");
        console.log(firstCut);
        fcpos1 = firstCut.search("position: {")
        fcpos2 = firstCut.search("},")
        firstCut = firstCut.slice(fcpos1+10,fcpos2);
        firstCut = firstCut + "}";

        fcpos3 = firstCut.search("{lat: ")
        fcpos4 = firstCut.search(",")
        ltd_str = firstCut;
        lng_str = firstCut;
        latitude = ltd_str.slice(fcpos3+5,fcpos4);

        fcpos5 = firstCut.search("lng: ")
        fcpos6 = firstCut.search("}")
        longitude = lng_str.slice(fcpos5+5,fcpos6);

        
        targetPoint = i;
        marker_pos = strData.search("var marker_"+targetPoint);

        // Content Target
        var firstContentCut = contentStrData.slice(content_pos,content_pos+500)
        var finalConCutPos = firstContentCut.search(";")
        firstContentCut.slice(0,finalConCutPos);
        console.log("Content "+ i + " Final Data :");
        console.log(firstContentCut);

        fccpos1 = firstContentCut.search("<p><b>Name :")
        fccpos2 = firstContentCut.search("</b>'+")
        firstContentCut = firstContentCut.slice(fccpos1+12,fccpos2);
         

        dataSet.push({
          lat_lng: firstCut,
          lat: latitude,
          lng: longitude,
          cityName: cityName,
          dr_name: firstContentCut
        })


      }else{
        i = 100000;
      }
      
    }
    
    }

   
    return dataSet;
  });

  await result;

  console.log(result)

  let appendData = jsonDatabase;
  appendData.push(result)
  fs.writeFileSync('data/database.json', JSON.stringify(appendData));
  
  process.exit(1);
  // await browser.close();
 
}
}


getAutoData();


// # Get * 404 => 200 : API RESPONSE : UNAUTHORIZED ACCESS
app.all("/*", (req, res) => {
  return res
    .status(200)
    .send({ status: "false", message: "You're not authorized!" });
});

const port = process.env.PORT || 5002;
app.listen(port, function () {
  console.log(`Node app is running on port ${port}`);
});
