window.settings = {
  start: {
    book: "Cartea",
    chapter: "Capitolul",
    verse: "Versetul"
  },
  stop: {
    book: "Apocalipsa",
    chapter: "22",
    verse: "21"
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
  init_verses();

  let days = generate_consecutive_days(number_of_days, start_date);

  let start_verse = 0;
  let result = [];

  for (let day_index = 0; day_index < number_of_days; day_index++) {
    result.push({
      day: day_index,
      date: days[day_index],
      verse_start: parseInt(start_verse),
      verse_stop: parseInt(start_verse) + parseInt(verses_per_day) - 1
    });

    start_verse = parseInt(start_verse) + parseInt(verses_per_day);
  }

  return result;
}

function short_verse(verse) {
  return verse.replace(/([^\p{L}\s]*\p{L})\p{L}*/gu, "$1");
}

function verse_text(verse, short = false) {
  if (short) {
    let res = short_verse(verse);
    return res;
  }

  return verse;
}

function full_text_verses(start, stop, short = false) {

  let text = "";
  for (let verse_index = start; verse_index <= stop; verse_index++) {
    text += "<p>"
      + window.settings.verses[verse_index].reference + ": "
      + verse_text(window.settings.verses[verse_index].text, short)
      + "</p>";
  }

  return text;
}

function show_plan(plan) {
  $("div#result").html("");

  let optional_show_long_text = "";
  if ($("#include-texts").is(':checked')) {
    optional_show_long_text = "<th>Versete</th>";
  }

  let optional_show_short_text = "";
  if ($("#include-texts-short").is(':checked')) {
    optional_show_short_text = "<th>Versete prescurtate</th>";
  }

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
      optional_show_long_text +
      optional_show_short_text +
    "</tr></thead>";

  let html_b = "<tbody>";

  for (item of plan) {
    let optional_show_long_text_b = "";
    if ($("#include-texts").is(':checked')) {
      optional_show_long_text_b = "<td>" + full_text_verses(item.verse_start, item.verse_stop, false) + "</td>"
    }

    let optional_show_short_text_b = "";
    if ($("#include-texts-short").is(':checked')) {
      optional_show_short_text_b = "<td>" + full_text_verses(item.verse_start, item.verse_stop, true) + "</td>"
    }

    let references = "";
    if (item.verse_start === item.verse_stop) {
      references =
        window.settings.verses[item.verse_start].reference;
    } else {
      references =
          (window.settings.verses[item.verse_start].reference + " - "
         + window.settings.verses[item.verse_stop].reference);
    }

    html_b +=
      "<tr>" +
        "<td>" +
          item.date +
        "</td>" +
        "<td> Ziua " +
          (parseInt(item.day) + 1) +
        "</td>" +
        "<td>" + references +
        "</td>" +
         optional_show_long_text_b +
         optional_show_short_text_b +
      "</tr>";
  }

  html_plan += html_b;
  html_plan += "</tbody></table>";
  $("div#result").append(html_plan);
}

function get_verses_from_chapter(book_index, chapter_index, verse_index, to) {
  // input: Book index, chapter index, verse index, to = "to end" or number
  // Return the verses in this chapter starting with verse index until the end or given verse number
  var result = [];
  chapter_index = parseInt(chapter_index);
  verse_index = parseInt(verse_index);
  if (to !== "to end") {
    to = parseInt(to);
  }

  var temp_verses = window.bible_cornilescu[book_index].chapters[chapter_index];

  var index = 0;
  for (var verse of temp_verses) {
    if (index >= verse_index) {
      if (to === "to end") {
        result.push({
          reference: window.books[book_index] + " " + (chapter_index + 1) + ":" + (index + 1),
          text: temp_verses[index],
          correct: false,
          tried: false,
        });
      } else {
        if (index <= to) {
          result.push({
            reference: window.books[book_index] + " " + (chapter_index + 1) + ":" + (index + 1),
            text: temp_verses[index],
            correct: false,
            tried: false,
          });
        }
      }
    }
    index++;
  }

  return result;
}

function init_verses() {
  // Generate the list of texts to be used in exercises, based on the settings
  if (window.settings.start.book === window.settings.stop.book) {
    if (window.settings.start.chapter === window.settings.stop.chapter) {
      // the same book and chapter
      var all_verses = [];
      var temp_verses = get_verses_from_chapter(
        search_book(window.settings.start.book),
        window.settings.start.chapter - 1,
        window.settings.start.verse - 1,
        window.settings.stop.verse - 1
      );
      window.settings.verses = temp_verses;
    } else {
      // the same book
      var start_book_index = search_book(window.settings.start.book);
      var start_chapter_index = window.settings.start.chapter - 1;
      var stop_chapter_index = window.settings.stop.chapter - 1;
      var start_verse_index = window.settings.start.verse - 1;
      var stop_verse_index = window.settings.stop.verse - 1;

      var all_verses = [];
      var temp_verses = get_verses_from_chapter(start_book_index, start_chapter_index, start_verse_index, "to end");

      for (let v of temp_verses) {
        all_verses.push(v);
      }

      var next_chapter = start_chapter_index + 1;
      while(next_chapter < stop_chapter_index) {
        temp_verses = get_verses_from_chapter(start_book_index, next_chapter, 0, "to end");
        for (let v of temp_verses) {
          all_verses.push(v);
        }
        next_chapter++;
      }

      temp_verses = get_verses_from_chapter(start_book_index, stop_chapter_index, 0, stop_verse_index);
      for (let v of temp_verses) {
        all_verses.push(v);
      }
      window.settings.verses = all_verses;
    }
  } else {
    // different books
    var all_verses = [];

    for (var book_index = search_book(window.settings.start.book); book_index <= search_book(window.settings.stop.book); book_index++) {
      var chapter_start_from = 0;
      var verse_start_from = 0;

      var book_chapters = window.bible_cornilescu[book_index].chapters.length;
      var chapter_stop = book_chapters - 1;
      var verse_stop = "to end";

      if (book_index === search_book(window.settings.start.book)) {
        chapter_start_from = window.settings.start.chapter - 1;
        verse_start_from = window.settings.start.verse - 1;
      }

      if (book_index === search_book(window.settings.stop.book)) {
        chapter_stop = window.settings.stop.chapter - 1;
        verse_stop = window.settings.stop.verse - 1;
      }

      for(var chapter_index = chapter_start_from; chapter_index <= chapter_stop; chapter_index++)  {
        var temp_verses = get_verses_from_chapter(book_index, chapter_index, verse_start_from, verse_stop);
        for (let v of temp_verses) {
          all_verses.push(v);
        }
      }
    }
    window.settings.verses = all_verses;
  }

  for (let a_verse of window.settings.verses) {
    // keep a copy, for correct order, used on read
    window.settings.all_texts.push(a_verse);
  }

  window.settings.title = window.settings.title + " (" + window.settings.verses.length + " versete)";
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
