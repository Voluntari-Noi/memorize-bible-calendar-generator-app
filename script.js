function format_date(date) {
  var dd = String(date.getDate()).padStart(2, '0');
  var mm = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
  var yyyy = date.getFullYear();

  return dd + '.' + mm + '.' + yyyy;
}

function generate_consecutive_days(number_of_days, start_date) {
  let result = [];

  for (let i = 0; i < number_of_days; i++) {
      let item_date = new Date(start_date);
      item_date.setDate(item_date.getDate() + i);
      result.push(format_date(item_date));
  }

  return result;
}

function generate_plan(number_of_days, start_date, verses_per_day) {
  let days = generate_consecutive_days(number_of_days, start_date);

  let start_verse = 0;
  let result = [];

  for (let day_index = 0; day_index < number_of_days; day_index++) {
    result.push({
      day: day_index,
      date: days[day_index],
      verse_start: parseInt(start_verse) + 1,
      verse_stop: parseInt(start_verse) + parseInt(verses_per_day)
    });

    start_verse = parseInt(start_verse) + parseInt(verses_per_day);
  }

  return result;
}

function show_plan(plan) {
  $("div#result").html("");

  let html_plan = "<table><thead>" +
    "<tr>" +
      "<th>" +
        "Data" +
      "</th>" +
      "<th>" +
        "Ziua" +
      "</th>" +
      "<th>" +
        "Versetele noi de memorat" +
      "</th>" +
    "</tr></thead>";

  let html_b = "<tbody>";

  for (item of plan) {
    html_b +=
      "<tr>" +
        "<td>" +
          item.date +
        "</td>" +
        "<td> Ziua " +
          (parseInt(item.day) + 1) +
        "</td>" +
        "<td>" +
          (item.verse_start + " - " + item.verse_stop) +
        "</td>" +
      "</tr>";
  }

  html_plan += html_b;
  html_plan += "</tbody></table>";
  $("div#result").append(html_plan);
}

function init() {
  document.getElementById('start-date').valueAsDate = new Date();
}

$(document).ready(function () {
  init();

  $("button#generate").on("click", function () {
    let days = $("input#number-of-days").val();
    let start_date = $("input#start-date").val();
    let verses_per_day = $("input#verses-per-day").val();
    let plan = generate_plan(days, start_date, verses_per_day);
    console.log(plan);

    show_plan(plan);
    $("button#export").show();
  });

  $("button#export").on("click", function () {
    $("table").tableExport();
    console.log("Download...");
  });
});
