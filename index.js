const puppeteer = require("puppeteer");
const express = require("express");
const app = express();

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

async function getAutoData(profile_id) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.strava.com/activities/" + profile_id);

  result = await page.evaluate(() => {
    var dataSet = [];
    var selecor = document.getElementsByClassName("Stat--stat-value--3bMEZ");

    var distance = selecor[3].innerText;
    var time = selecor[4].innerText;
    var elevation = selecor[5].innerText;
    var calories = selecor[6].innerText;

    var jsonData = {
      distance: distance,
      time: time,
      elevation: elevation,
      calories: calories,
    };
    dataSet.push(jsonData);

    console.log(dataSet);
    return dataSet;
  });
  browser.close();
  return await result;
}

app.get("/getProfileData", function (req, res) {
  var id = req.query.id;
  getAutoData(id).then(function (leaderboard_data) {
    res.json({ status: "true", data: leaderboard_data });
  }, errHandler);
});

var errHandler = function (err) {
  console.log(err);
};

// # Get * 404 => 200 : API RESPONSE : UNAUTHORIZED ACCESS
app.all("/*", (req, res) => {
  return res
    .status(200)
    .send({ status: "false", message: "You're not authorized!" });
});

const port = process.env.PORT || 5000;
app.listen(port, function () {
  console.log(`Node app is running on port ${port}`);
});
