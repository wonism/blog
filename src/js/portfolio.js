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
};
