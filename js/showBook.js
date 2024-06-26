$(function () {

  let params = URLSearchParams && new URLSearchParams(document.location.search.substring(1));
  //передаем урл какой-то книги
  let url = params && params.get("url") && decodeURIComponent(params.get("url"));
  //открытие локальной книги
  let book = params && params.get("book") && decodeURIComponent(params.get("book"));

  var font_size = 100;
  var themes = [];
  var current_theme;

  let handler = TreineticEpubReader.handler();

  themes = handler.getAvailableThemes().filter((t) => {
    return t.id != 'author-theme';
  });

  handler.registerEvent("onEpubLoadSuccess", () => {
    var settings = handler.getCurrentReaderSettings();
    font_size = settings.fontSize;
    current_theme = settings.theme == 'author-theme' ? 'default-theme' : settings.theme;
    // isHorizontalScroll = (settings.scroll == "auto") && (settings.syntheticSpread == "auto");
    isHorizontalScroll = false;

    if (isHorizontalScroll) {
      $("#reading-area").addClass("reading-area-margin");
    } else {
      $("#reading-area").removeClass("reading-area-margin");
    }

    setViewFontSize(font_size);
    setViewTheme(current_theme);
    setViewType(isHorizontalScroll ? "h" : "v");

    setVerticalScroll(1000);

    TreineticEpubReader.handler().setAutoBookmark(true);
    TreineticEpubReader.handler().setTheme(current_theme);
    TreineticEpubReader.handler().changeColumnMaxWidth(1200);
  });

  handler.registerEvent("onEpubLoadFail", () => {

  });

  handler.registerEvent("onTOCLoaded", (hasTOC) => {
    if (hasTOC) {
      var toc = handler.getTOCJson();
      $('.drawer-section').empty();
      $('.drawer-section').append($(crateOL_Recursively(JSON.parse(toc))));
    }
  });

  handler.registerEvent("onReaderHeightRequest", () => {
    return "100%";
  });


  setViewFontSize(font_size);
  setTheams(themes);
  setViewType("v");

  setVerticalScroll(1000);

  var config = TreineticEpubReader.config();
  var settings = handler.getCurrentReaderSettings();
  config.jsLibRoot = "./assets/workers/";
  config.loader = "one"
  TreineticEpubReader.create("#epub-reader-frame");
  if (url) {
    TreineticEpubReader.open(url);
  }else if (book) {
    TreineticEpubReader.open('./books/' + book);
  } else {
    TreineticEpubReader.open("./assets/epub/prygody-bravogo-voyaka-shvejka.epub");
  }

  $(".increase-font-size").on("click", function () {
    var ext = TreineticEpubReader.handler();
    var range = ext.getRecommendedFontSizeRange();
    var current = ext.getCurrentReaderSettings().fontSize;
    if (current + 5 <= range.max) {
      font_size = current + 5;
      ext.changeFontSize(font_size);
      setViewFontSize(font_size);
    }
  });

  $(".decrease-font-size").on("click", function () {
    var ext = TreineticEpubReader.handler();
    var range = ext.getRecommendedFontSizeRange();
    var current = ext.getCurrentReaderSettings().fontSize;
    if (range.min <= current - 5) {
      font_size = current - 5;
      ext.changeFontSize(font_size);
      setViewFontSize(font_size);
    }
  });

  $("body").on("click", ".theme-color-block", function () {
    var id = $(this).data("theme-id");
    setViewTheme(id);
    TreineticEpubReader.handler().setTheme(id);
  });

  function setHorizontalScroll(timer = 500) {
    setTimeout(() => {
      let ext = TreineticEpubReader.handler();
      ext.setScrollOption("auto");
      ext.setDisplayFormat("auto");
      $("#reading-area").addClass("reading-area-margin");
    }, timer);
  }

  function setVerticalScroll(timer = 500) {
    $("#reading-area").removeClass("reading-area-margin");
    setTimeout(() => {
      let ext = TreineticEpubReader.handler();
      ext.setScrollOption("scroll-continuous");
      ext.setDisplayFormat("single");
    }, timer);
  }

  // $(".vertical-view").on("click", function () {
  //   setViewType("v");
  //   setVerticalScroll();
  // });
  //
  // $(".horizontal-view").on("click", function () {
  //   setViewType("h");
  //   setHorizontalScroll();
  // });

  $(".prev-button").on("click", function () {
    $(".pre-next-wrapper").removeClass("noPreview");
    $(".pre-next-wrapper").removeClass("noNext");
    let etc = TreineticEpubReader.handler();
    if (etc.hasPrevPage()) {
      etc.prevPage();
      if (!etc.hasPrevPage()) {
        $(".pre-next-wrapper").addClass("noPreview");
      }
    } else {
      $(".pre-next-wrapper").addClass("noPreview");
    }
  });

  $(".next-button").on("click", function () {
    $(".pre-next-wrapper").removeClass("noPreview");
    $(".pre-next-wrapper").removeClass("noNext");
    let etc = TreineticEpubReader.handler();
    if (etc.hasNextPage()) {
      etc.nextPage();
      if (!etc.hasNextPage()) {
        $(".pre-next-wrapper").addClass("noNext");
      }
    } else {
      $(".pre-next-wrapper").addClass("noNext");
    }
  });

  $(".drawer-box").on("click", function () {
    toggleDrawer();
  });
  $(".drawer-backdrop").on("click", function () {
    toggleDrawer();
  });

  $("body").on("click", ".toc-item", function () {
    var link = $(this).data("link");
    let etc = TreineticEpubReader.handler();
    etc.goToPage(link)
    setTimeout(function () {
      $(".drawer-backdrop").hide();
    }, 500);
    $(".drawer-section").removeClass("drawer-section-show");
  })


  function setViewFontSize(size) {
    $(".font-size-view").html(size + "%");
  }

  function setViewType(type) {
    console.log("view type..... " + type)
    // $(".horizontal-view").removeClass("sc-selected");
    $(".vertical-view").removeClass("sc-selected");
    if (type == "h") {
      // $(".horizontal-view").addClass("sc-selected")
      $(".page-controls").addClass("page-controls-visible");
    } else if (type == "v") {
      $(".page-controls").removeClass("page-controls-visible");
      // $(".vertical-view").addClass("sc-selected")
    }
  }

  function setViewTheme(id) {
    if (id == "night-theme") {
      $(".page-controls").addClass("night-mode-rest")
      $(".nav-design").addClass("night-mode-rest")
    } else {
      $(".page-controls").removeClass("night-mode-rest")
      $(".nav-design").removeClass("night-mode-rest")
    }
    $(".theme-color-block").removeClass("th-selected");
    $(".theme-color-block[data-theme-id='" + id + "']").addClass("th-selected");
    current_theme = id;
  }

  function setTheams(themearray) {
    themearray.some(function (theme) {
      $(".theme-buttons-section").append('<div class="theme-color-block ' + theme.id + '"  data-theme-id="' + theme.id + '"></div>');
    });
  }


  function crateOL_Recursively(json) {
    var string = "<ol class='toc-ol'>";
    json.some(function (item) {
      string += `<li><a class="toc-item" data-link="${item.Id_link}">${item.name}</a>`;
      if (item.sub.length > 0) {
        string += crateOL_Recursively(item.sub);
      }
      string += "</li>";
    });
    return string + "</ol>";
  }

  function toggleDrawer() {
    if ($(".drawer-section").hasClass("drawer-section-show")) {
      setTimeout(function () {
        $(".drawer-backdrop").hide();
      }, 500);
      $(".drawer-section").removeClass("drawer-section-show");
    } else {
      $(".drawer-backdrop").show();
      setTimeout(function () {
        $(".drawer-section").addClass("drawer-section-show");
      });
    }
  }

});
