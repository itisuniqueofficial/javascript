(function (window, document) {
  var hearts = [];

  function init() {
    addStyles('.heart {' +
      'width: 10px;' +
      'height: 10px;' +
      'position: fixed;' +
      'background: #f00;' +
      'transform: rotate(45deg);' +
      '}');
    addClickListener();
    animate();
  }

  function animate() {
    for (var i = hearts.length - 1; i >= 0; i--) {
      var heart = hearts[i];
      heart.y--;
      heart.scale = Math.abs(Math.sin(Date.now() * 0.005)) + 0.5;
      heart.alpha -= 0.01;

      if (heart.alpha <= 0) {
        document.body.removeChild(heart.el);
        hearts.splice(i, 1);
      } else {
        heart.el.style.cssText =
          'left: ' + heart.x + 'px;' +
          'top: ' + heart.y + 'px;' +
          'opacity: ' + heart.alpha + ';' +
          'transform: scale(' + heart.scale + ') rotate(45deg);' +
          'background: ' + heart.color + ';' +
          'z-index: 99999';
      }
    }
    requestAnimationFrame(animate);
  }

  function addClickListener() {
    var oldOnClick = window.onclick;
    window.onclick = function (event) {
      oldOnClick && oldOnClick();
      createHeart(event);
    }
  }

  function createHeart(event) {
    var heart = document.createElement('div');
    heart.className = 'heart';
    var newHeart = {
      el: heart,
      x: event.clientX - 5,
      y: event.clientY - 5,
      scale: 1,
      alpha: 1,
      color: getRandomColor()
    };
    hearts.push(newHeart);
    document.body.appendChild(heart);
  }

  function addStyles(styles) {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(styles));
    document.head.appendChild(style);
  }

  function getRandomColor() {
    return 'rgb(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ')';
  }

  window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function (callback) {
        setTimeout(callback, 1000 / 60);
      };
  })();

  init();
})(window, document);
