(function(){

  /* Get DOM elements */
  var container = document.querySelector('#container');
  /* buttons */
  var startbutton = document.querySelector('#intro button');
  var infobutton = document.querySelector('#infos');
  var installbutton = document.querySelector('#install');
  var winbutton = document.querySelector('#win button');
  var reloadbutton = document.querySelector('#reload');
  var soundbutton = document.querySelector('#sound');
  var errorbutton = document.querySelector('#error button');
  /* Get sounds */
  var winsound = document.querySelector('#winsound');
  var errorsound = document.querySelector('#errorsound');

  /* Prepare canvas */
  var c = document.querySelector('canvas'); // selects the first canvas element
  var cx = c.getContext('2d'); // returns CanvasRenderingContext2D object
  var letter = null; // string the current game letter
  var fontfamily = '"ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", Osaka, "メイリオ", Meiryo, "ＭＳ Ｐゴシック", "MS PGothic", sans-serif';
  var fontsize = 300;
  var paintcolour = [240, 240, 240];
  var textcolour = [25, 255, 25];
  var linewidth = null;
  var pixels = 0;
  var letterpixels = 0;

  /* Canvas mouse and touch statuses */
  var mousedown = false;
  var touched = false;
  var oldx = 0; // caches the position of the last paint point
  var oldy = 0; // caches the position of the last paint point

  /* Overall game presets */
  var state = 'intro';
  var sound = true;
  var currentstate;

  function init() {
    fontsize = container.offsetHeight / 1.5; // dynamically adjusts on resize
    linewidth = container.offsetHeight / 27; // dynamically adjusts on resize
    paintletter();
    setstate('intro');
  }

  function togglesound() {
    if (sound) {
      sound = false;
      soundbutton.className = 'navbuttonoff';
    } else {
      sound = true;
      soundbutton.className = 'navbutton';
    }
  }

  function showerror() {
    setstate('error');
    if (sound) {
      errorsound.play();
    }
    if (navigator.vibrate) {
      navigator.vibrate(100); // pulses device, if device has hardware
    }
  }

  function showinfo() {
    if (state !== 'info') {
      setstate('info');
    } else {
      setstate('play');
    }
  }

  function setstate(newstate) {
    state = newstate;
    container.className = //newstate;
      newstate + ' page-container';
    currentsate = state;
  }
  function retry(ev) {
    // Reset everything
    mousedown = false;
    oldx = 0;
    oldy = 0;
    paintletter(letter);
  }
  function winner() {
    paintletter();
  }
  function start() {
    paintletter(letter);
  }
  function cancel() {
    paintletter();
  }
  function paintletter(retryletter) {
    var chars = [
'あ'
,'い'
,'う'
,'え'
,'お'
,'か'
,'き'
,'く'
,'け'
,'こ'
,'さ'
,'し'
,'す'
,'せ'
,'そ'
,'た'
,'ち'
,'つ'
,'て'
,'と'
,'な'
,'に'
,'ぬ'
,'ね'
,'の'
,'は'
,'ひ'
,'ふ'
,'へ'
,'ほ'
,'ま'
,'み'
,'む'
,'め'
,'も'
,'や'
,'ゆ'
,'よ'
,'ら'
,'り'
,'る'
,'れ'
,'ろ'
,'わ'
,'を'
,'ん'
    ];

    letter = retryletter || chars[parseInt(Math.random() * chars.length,10)];
    c.width = container.offsetWidth;
    c.height = container.offsetHeight;
    cx.font = 'bold ' + fontsize + 'px ' + fontfamily;
    cx.fillStyle = 'rgb(' + textcolour.join(',') + ')';
    cx.strokeStyle = 'rgb(' + paintcolour.join(',') + ')';
    cx.shadowOffsetX = 2;
    cx.shadowOffsetY = 2;
    cx.shadowBlur = 4;
    cx.shadowColor = '#666';

    cx.textBaseline = 'baseline';
    cx.lineWidth = linewidth;
    cx.lineCap = 'round';
    cx.fillText(
      letter,
      (c.width - cx.measureText(letter).width) / 2,
      (c.height / 1.3)
    );
    pixels = cx.getImageData(0, 0, c.width, c.height);
    letterpixels = getpixelamount(
      textcolour[0],
      textcolour[1],
      textcolour[2]
    );
    cx.shadowOffsetX = 0;
    cx.shadowOffsetY = 0;
    cx.shadowBlur = 0;
    cx.shadowColor = '#333';
    setstate('play');
  }

  function getpixelamount(r, g, b) {
    var pixels = cx.getImageData(0, 0, c.width, c.height);
    var all = pixels.data.length;
    var amount = 0;
    for (i = 0; i < all; i += 4) {
      if (pixels.data[i] === r &&
          pixels.data[i+1] === g &&
          pixels.data[i+2] === b) {
        amount++;
      }
    }
    return amount;
  }

  // Executes on mouse/touch move on touched/mousedown mode 
  function paint(rx, ry) {
    //var rx = x - xoffset;
    //var ry = y - yoffset;
    var colour = pixelcolour(rx, ry); // the current background rgb

    // Detects for the edge of the letter
    if( colour.r === 0 && colour.g === 0 && colour.b === 0) {
      showerror();
    } else {
      // Trace the paintbrush
      cx.beginPath();
      if (oldx > 0 && oldy > 0) {
        cx.moveTo(oldx, oldy);
      }
      cx.lineTo(rx, ry);
      cx.stroke();
      cx.closePath();
      oldx = rx;
      oldy = ry;
    }
  }

  function pixelcolour(x, y) {
    var index = ((y * (pixels.width * 4)) + (x * 4));
    return {
      r:pixels.data[index],
      g:pixels.data[index + 1],
      b:pixels.data[index + 2],
      a:pixels.data[index + 3]
    };
  }

  function pixelthreshold() {
    if (state !== 'error') {
      if (getpixelamount(
        paintcolour[0],
        paintcolour[1],
        paintcolour[2]
      ) / letterpixels > 0.35) {
       setstate('win');												// WIN
       if (sound) {
         winsound.play();
       }
      }
    }
  }

  /*function install() {
    if (navigator.mozApps) {
      var checkIfInstalled = navigator.mozApps.getSelf();
      checkIfInstalled.onsuccess = function () {
        if (checkIfInstalled.result) {
          installbutton.style.display = "none";
        } else {
          manifestURL = location.href.substring(0, location.href.lastIndexOf("/")) + "/manifest.webapp";
          var installApp = navigator.mozApps.install(manifestURL);
          installApp.onsuccess = function(data) {
            installbutton.style.display = "none";
          };
          installApp.onerror = function() {
            alert("Install failed\n\n:" + installApp.error.name);
          };
        }
      };
    }
  }*/

  /* Mouse event listeners */

  function onmouseup(ev) {
    ev.preventDefault();

    // Reset everything
    oldx = 0;
    oldy = 0;
    mousedown = false;
    pixelthreshold();
  }

  function onmousedown(ev) {
    ev.preventDefault();
    mousedown = true;
  }

  function onmousemove(ev) {
    ev.preventDefault();
    if (mousedown) {
      paint(ev.clientX, ev.clientY);
      ev.preventDefault();
    }
  }

  /* Touch event listeners */

  function ontouchstart(ev) {
    touched = true;
  }

  function ontouchend(ev) {
    touched = false;

    // Reset everything
    oldx = 0;
    oldy = 0;
    pixelthreshold();
  }

  function ontouchmove(ev) {
    if (touched) {
      paint(
        ev.changedTouches[0].pageX,
        ev.changedTouches[0].pageY
      );
      ev.preventDefault();
    }
  }

  /* Button event handlers */

  errorbutton.addEventListener('click', retry, false);
  infobutton.addEventListener('click', showinfo, false);
  //installbutton.addEventListener('click', install, false);
  reloadbutton.addEventListener('click', cancel, false);
  soundbutton.addEventListener('click', togglesound, false);
  winbutton.addEventListener('click', winner, false);
  startbutton.addEventListener('click', start, false);

  /* Canvas event handlers */

  c.addEventListener('mouseup', onmouseup, false);
  c.addEventListener('mousedown', onmousedown, false);
  c.addEventListener('mousemove', onmousemove, false);
  c.addEventListener('touchstart', ontouchstart, false);
  c.addEventListener('touchend', ontouchend, false);
  c.addEventListener('touchmove', ontouchmove, false);

  window.addEventListener('load',init, false);
  window.addEventListener('resize',init, false);

  /* Cache update ready? Reload the page! */
  /*var cache = window.applicationCache;
  function refresh() {
    if (cache.status === cache.UPDATEREADY) {
     cache.swapCache();
     window.location.reload();
    }
  }
  cache.addEventListener('updateready', refresh, false);*/

})();