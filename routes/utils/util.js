let sql_queries = require('../sql/sqlQueries')


/**
 * Converts the day value from a Date object into days of week in English
 * @param day The day value from the getDay method of a Date object
 * @returns {string}
 */

function convertDayToStr (day) {
  let dayStr;
  switch (day) {
    case 0:
      dayStr = 'Sunday';
      break;
    case 1:
      dayStr = 'Monday';
      break;
    case 2:
      dayStr = 'Tuesday';
      break;
    case 3:
      dayStr = 'Wednesday';
      break;
    case 4:
      dayStr = 'Thursday';
      break;
    case 5:
      dayStr = 'Friday';
      break;
    case 6:
      dayStr = 'Saturday';
      break;
    default:
      dayStr = "Error Day out of range! Please use a value from 0 to 6: " + day;
      break;
  }
  return dayStr;
}

/**
 * Converts the month of a Date object into the English string
 * @param month the return value from the getMonth method of a Date object
 * @returns {string}
 */
function convertMonthToStr (month) {
  let monthStr;
  switch (month) {
    case 1:
      monthStr = 'January';
      break;
    case 2:
      monthStr = 'February';
      break;
    case 3:
      monthStr = 'March';
      break;
    case 4:
      monthStr = 'April';
      break;
    case 5:
      monthStr = 'May';
      break;
    case 6:
      monthStr = 'June';
      break;
    case 7:
      monthStr = 'July';
      break;
    case 8:
      monthStr = 'August';
      break;
    case 9:
      monthStr = 'September';
      break;
    case 10:
      monthStr = 'October';
      break;
    case 11:
      monthStr = 'November';
      break;
    case 12:
      monthStr = 'December';
      break;
    default:
      monthStr = "Error can't get valid month";
      break;
  }
  return monthStr;
}

function getDateInStr(today) {
  if (typeof today === 'undefined') {
    today = new Date();
  }
  else if (typeof today === 'string') {
    today = new Date(today);
  }

  const dayStr = convertDayToStr(today.getDay());
  const monthStr = convertMonthToStr(today.getMonth() + 1);
  const date = dayStr + ', ' + today.getDate() + ' ' + monthStr + ' ' + today.getFullYear();
  return date;
}

function getDate(today) {
  if (typeof today === 'undefined') {
    today = new Date();
  }
  let year = today.getFullYear();
  let month = today.getMonth() + 1;
  let day = today.getDate();
  month = month < 10 ? "0" + month : month;
  day = day < 10 ? "0" + day : day;

  const date = year + "-" + month + "-" + day;
  return date;
}


// //date = yyyy-mm-dd
// function convertDateToStr(date) {
//   let components = date.split("-");
//   let newdate = new Date(date)
//
//   return convertDayToStr(newdate.getDay()) + ", " + parseInt(components[2]) + " "  + convertMonthToStr(parseInt(components[1])) + " "  + components[0];
// }

module.exports.convertDayToStr = convertDayToStr;
module.exports.convertMonthToStr = convertMonthToStr;
module.exports.getDateInStr = getDateInStr;
module.exports.getDate = getDate;
// module.exports.convertDateToStr = convertDateToStr;

function checkAndExtend(val) {
  if (val < 10) {
    val = '0' + val;
  }
  return val;
}

function getTime(today) {
  if (typeof today === 'undefined') {
    today = new Date();
  }

  let hours = checkAndExtend(today.getHours());
  let minutes = checkAndExtend(today.getMinutes());
  let seconds = checkAndExtend(today.getSeconds());
  return hours + ':' + minutes + ':' + seconds;
}

module.exports.getTime = getTime;

function pad(str) {
  return "'" + str + "'";
}

module.exports.pad = pad;


function convert24to12Time (time) {
  components = time.split(":");
  let firstHalf, secondHalf;
  let x = parseInt(components[0]);
  if(x >= 12) {
    secondHalf = " PM";
    firstHalf = x === 12 ? 12 : x - 12;
  }
  else {
        secondHalf = " AM";
        firstHalf = x === 0 ? 12 : x;
  }
  return firstHalf + "." + components[1] + secondHalf;
}

module.exports.convert24to12Time = convert24to12Time;

function separateData(data, menuCount) {
  let separatedData = new Array(menuCount)
  for (let i = 0; i < menuCount; i++) {
    separatedData[i] = []
  }
  // console.log("initialised array", separatedData, separatedData[0], separatedData[1]);
  for (let i = 0, j = 0; i < data.length && j < menuCount; i++) {
    // console.log(data[i])
    if (i=== 0 || separatedData[j][0].menuname == data[i].menuname) {
      separatedData[j].push(data[i])
    } else {
      // console.log(j, separatedData[j][0].menuname, data[i].menuname);
      separatedData[++j].push(data[i])
    }
  }
  // console.log(separatedData);
  return separatedData
}

module.exports.separateData = separateData;

function getPool(pool) {
  require('dotenv').config();
  const {Pool} = require('pg');

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  return pool
}

function updateSqlServer(pool) {
  if (typeof pool === 'undefined') {
    pool = getPool(pool)
  }

  let query = sql_queries.delete_old_entries;
  let today = new Date();
  let time = getTime(today);
  let date = getDate(today);
  console.log(time, date);

  let queryArgs = [
    time,
    date
  ];

  pool.query(query, queryArgs, (err, data) => {
      if (err) {
          console.error(err)
      } else {
          console.log('successfully refreshed Booked Table entries!')
      }
  })
}

module.exports.updateSqlServer = updateSqlServer;

function setupUserAccount(pool, username) {
  if (typeof pool === 'undefined') {
    pool = getPool(pool)
  }
  const starting_pts = 0
  const queryArgs = [
    username,
    starting_pts
  ]

  let query = sql_queries.setup_user_awards;
  pool.query(query, queryArgs, (err, data) => {
    if (err) {
      console.error(err)
    } else {
      console.log("successfully created user awards account!")
    }
  })
}

module.exports.setupUserAccount = setupUserAccount

function getTimeStr(time) {
  const am = 'am'
  const pm = 'pm'

  let timeArgs = time.split(':')
  let timeHour = parseInt(timeArgs[0])
  // console.log(timeHour)
  let timeString = ''
  // console.log("What is time/12", Math.floor(timeHour / 12))

  if (Math.floor(timeHour / 12) > 0) {
    timeString = timeString + pm
    timeHour %= 12
  } else {
    timeString = timeString + am
  }
  if (timeArgs[1] != '00') {
    timeString = time + timeString
  } else {
    timeString = timeHour + timeString
  }
  // console.log(timeString)
  return timeString
}

/**
 * Assuming both times is in 24 hr format
 * @param start
 * @param end
 */
function getTimeRangeAsStr(start, end) {

  let startStr = getTimeStr(start)
  let endStr = getTimeStr(end)

  return startStr + ' - ' + endStr
}

module.exports.getTimeRangeAsStr = getTimeRangeAsStr

function getCorrectTimeFormat(time) {
  let timeArgs = time.split(':')
  if (timeArgs.length < 3) {
    return time + ':00'
  }
  return time
}

/**
 * Add interval to a time str
 * @param time a string value of time
 * @param interval an integer in minutes
 */
function addIntervalToTime(time, interval) {
  let timeArgs = time.split(':')
  let hours = timeArgs[0]
  let minutes = timeArgs[1]
  minutes = parseInt(minutes) + interval
  if (Math.floor(minutes / 60) > 0) {
    hours = parseInt(hours) + Math.floor(minutes / 60)
    minutes = minutes % 60
  }

  return getCorrectTimeFormat(hours +':'+minutes)
}

module.exports.getCorrectTimeFormat = getCorrectTimeFormat
module.exports.addIntervalToTime = addIntervalToTime