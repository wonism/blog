var ready = function () {
  var portfolios = jj('.work'), workSites = jj('.work-summary a');

  var portfolioCounter = 0, portfolioLength = portfolios.length;
  for (; portfolioCounter < portfolioLength; portfolioCounter++) {
    addEvent(portfolios[portfolioCounter], 'click', function () {
      ga('send', 'event', '포트폴리오 리스트', 'Button Press', '포트폴리오 클릭 - ' +
          this.getElementsByClassName('work-name')[0].textContent.trim());
    });
  }

  var siteCounter = 0, siteLength = workSites.length;
  for (; siteCounter < siteLength; siteCounter++) {
    addEvent(workSites[siteCounter], 'click', function () {
      ga('send', 'event', '포트폴리오 상세', 'Button Press', '포트폴리오 링크 클릭');
    });
  }

  var drawChart = function () {
    var feEls = document.getElementsByClassName('fe');
    var beEls = document.getElementsByClassName('be');
    var deEls = document.getElementsByClassName('de');
    var exEls = document.getElementsByClassName('ex');
    var cmEls = document.getElementsByClassName('cm');
    var phEls = document.getElementsByClassName('ph');

    var feScore = 0, beScore = 0, deScore = 0, exScore = 0, cmScore = 0, phScore = 0;
    var feCnt = 0, beCnt = 0, deCnt = 0, exCnt = 0, cmCnt = 0, phCnt = 0;

    for (var i = 0, len = feEls.length; i < len; i++) {
      if (feEls[i].checked) {
        feScore += feEls[i].getAttribute('data-score') >> 0;
        feCnt++;
      }
    }

    for (i = 0, len = beEls.length; i < len; i++) {
      if (beEls[i].checked) {
        beScore += beEls[i].getAttribute('data-score') >> 0;
        beCnt++;
      }
    }

    for (i = 0, len = deEls.length; i < len; i++) {
      if (deEls[i].checked) {
        deScore += deEls[i].getAttribute('data-score') >> 0;
        deCnt++;
      }
    }

    for (i = 0, len = exEls.length; i < len; i++) {
      if (exEls[i].checked) {
        exScore += exEls[i].getAttribute('data-score') >> 0;
        exCnt++;
      }
    }

    for (i = 0, len = cmEls.length; i < len; i++) {
      if (cmEls[i].checked) {
        cmScore += cmEls[i].getAttribute('data-score') >> 0;
        cmCnt++;
      }
    }

    for (i = 0, len = phEls.length; i < len; i++) {
      if (phEls[i].checked) {
        phScore += phEls[i].getAttribute('data-score') >> 0;
        phCnt++;
      }
    }

    var ctx = document.getElementById('my-ability');
    var myChart = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: ['Front-end', 'Back-end', 'Design', 'Experience', 'Communication', 'Physical'],
          datasets: [
            {
              label: 'My Ability as a Developer',
              backgroundColor: 'rgba(54, 122, 189, .2)',
              borderColor: 'rgba(48, 73, 155, 1)',
              pointBackgroundColor: 'rgba(48, 73, 155, 1)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(39, 55 , 120, 1)',
              data: [
                (feCnt ? feScore / feCnt : 0),
                (beCnt ? beScore / beCnt : 0),
                (deCnt ? deScore / deCnt : 0),
                (exCnt ? exScore / exCnt : 0),
                (cmCnt ? cmScore / cmCnt : 0),
                (phCnt ? phScore / phCnt : 0)
              ]
            }
          ]
        }
    });
  };

  if (document.getElementById('my-ability')) {
    drawChart();

    document.body.onclick = function (e) {
      if (e.target.className.match(/^\s?skill\s+/)) {
        drawChart();
      }
    };
  }
};
