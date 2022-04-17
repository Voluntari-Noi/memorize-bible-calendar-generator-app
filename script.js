window.settings = {
  start: {
    book: "Cartea",
    chapter: "Capitolul",
    verse: "Versetul"
  },
  stop: {
    book: "Cartea",
    chapter: "Capitolul",
    verse: "Versetul"
  },
  verses: [
    {
      reference: "Geneza 1:1",
      text: "La început...",
      correct: false,
      tried: false,
    },
    {
      reference: "Geneza 1:2",
      text: "Demo text",
      correct: false,
      tried: false,
    },
    {
      reference: "Geneza 1:3",
      text: "Demo text",
      correct: false,
      tried: false,
    },
  ],
  all_texts: [],
};

function init_books_select() {
  for (let book of window.books) {
    $('select.select-start-book').append($('<option>', {
      value: book,
      text: book
    }));
    $('select.select-stop-book').append($('<option>', {
      value: book,
      text: book
    }));
  }
}

function search_book(book_name) {
  var index = 0;
  for (let book of window.books) {
    if (book === book_name) {
      return index;
    }
    index++;
  }

  return -1;
}

function init_verses_select(chapter, select) {
  // input: selected chapter, start/stop
  // Init the verses select based on current start/stop book and chapter
  const book_index = search_book(window.settings[select].book);
  const verses = window.bible_cornilescu[book_index].chapters[chapter-1].length;

  if (select === "start") {
    $('select.select-start-verse').html("<option selected hidden>Versetul</option>");
    for (let verse = 1; verse <= verses; verse++) {
      $('select.select-start-verse').append($('<option>', {
        value: verse,
        text: "Versetul " + verse
      }));
    }
  }

  if (select === "stop") {
    $('select.select-stop-verse').html("<option selected hidden>Versetul</option>");
    for (let verse = 1; verse <= verses; verse++) {
      $('select.select-stop-verse').append($('<option>', {
        value: verse,
        text: "Versetul " + verse
      }));
    }
  }
}

function init_chapters_select(book_name, select) {
  // input: romanian book name, start/stop
  // Init the chapters select (start or stop) with real chapters for given book
  const book_index = search_book(book_name);
  const book_chapters = window.bible_cornilescu[book_index].chapters.length;

  if (select === "start") {
    $('select.select-start-chapter').html("<option selected hidden>Capitolul</option>");
    for (let chapter = 1; chapter <= book_chapters; chapter++) {
      $('select.select-start-chapter').append($('<option>', {
        value: chapter,
        text: "Capitolul " + chapter
      }));
    }
  }

  if (select === "stop") {
    $('select.select-stop-chapter').html("<option selected hidden>Capitolul</option>");
    for (let chapter = 1; chapter <= book_chapters; chapter++) {
      $('select.select-stop-chapter').append($('<option>', {
        value: chapter,
        text: "Capitolul " + chapter
      }));
    }
  }
}

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
  init_books_select();
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

  $("select.form-select").on("change", function() {
    if($(this).hasClass("select-start-book")) {
      window.settings.start.book = this.value;
      init_chapters_select(this.value, "start");
      init_verses_select(1, "start");
      if ($("select.select-stop-book").val() === "Cartea") {
        // Most expected book to be the same
        $("select.select-stop-book").val(this.value).change();
      }
    }
    if($(this).hasClass("select-start-chapter")) {
      window.settings.start.chapter = this.value;
      init_verses_select(this.value, "start");
      if ($("select.select-stop-chapter").val() === "Capitolul") {
        // Most expected chapter to be the same
        $("select.select-stop-chapter").val(this.value).change();
      }
    }
    if($(this).hasClass("select-start-verse")) {
      window.settings.start.verse = this.value;
      if ($("select.select-stop-verse").val() === "Versetul") {
        $("select.select-stop-verse").val(
          // Most expected verse to be the last in the selected chapter
          $("select.select-stop-verse option").last().val()
        ).change();
      }
    }
    if($(this).hasClass("select-stop-book")) {
      window.settings.stop.book = this.value;
      init_chapters_select(this.value, "stop");
      init_verses_select(1, "stop");
    }
    if($(this).hasClass("select-stop-chapter")) {
      window.settings.stop.chapter = this.value;
      init_verses_select(this.value, "stop");
    }
    if($(this).hasClass("select-stop-verse")) {
      window.settings.stop.verse = this.value;
    }
  });
});
