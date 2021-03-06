class Activity {


  addTab(tab) {
    // console.log("addTab called");
    if (this.isValidPage(tab) === true) {
      if (tab.id && (tab.id != 0)) {
        tabs = tabs || [];
        var domain = this.extractHostname(tab.url);
        var isDifferentUrl = false;
        if (currentTab !== tab.url) {
          isDifferentUrl = true;
        }

        if (this.isNewUrl(domain) /*&& !this.isInBlackList(domain)*/) {
          var favicon = tab.favIconUrl;
          if (favicon === undefined) {
            favicon = 'chrome://favicon/' + domain;
          }
          // add new Tab object to tabs list
          var newTab = new Tab(domain, favicon);
          tabs.push(newTab);
        }

        if (isDifferentUrl) {
          this.setCurrentActiveTab(domain);
          var tabUrl = this.getTab(domain);
          if (tabUrl !== undefined)
            tabUrl.incCounter();
          // this.addTimeInterval(domain);
        }
      }
    } else this.closeIntervalForCurrentTab();
  }

  isValidPage(tab) {
    if (!tab || !tab.url || (tab.url.indexOf('http:') == -1 && tab.url.indexOf('https:') == -1) || tab.url.indexOf('chrome://') !== -1 || tab.url.indexOf('chrome-extension://') !== -1)
      return false;
    return true;
  }

  isNewUrl(domain) {
    if (tabs.length > 0)
      return tabs.find(o => o.url === domain) === undefined;
    else return true;
  }

  getTab(domain) {
    if (tabs !== undefined)
      return tabs.find(o => o.url === domain);
  }

  extractHostname(url) {
    var hostname;

    if (url.indexOf("//") > -1) {
      hostname = url.split('/')[2];
    }
    else {
      hostname = url.split('/')[0];
    }

    hostname = hostname.split(':')[0];
    hostname = hostname.split('?')[0];

    return hostname;
  }

  updateFavicon(tab) {
    var domain = this.extractHostname(tab.url);
    var currentTab = this.getTab(domain);
    if (currentTab !== null && currentTab !== undefined) {
      if (tab.favIconUrl !== undefined && tab.favIconUrl !== currentTab.favicon) {
        currentTab.favicon = tab.favIconUrl;
      }
    }
  }

  addTimeInterval(domain) {
    // console.log(`[addTimeInterval] called for domain: ${domain}`);
    // console.log(timeIntervalList);
    // look for time interval with inputted domain and current date
    // toLocaleDateString removes the time portion
    var today = getToday();
    var item = timeIntervalList.find(o => o.domain === domain && o.day == today);
    if (item != undefined) {
      if (item.day == today) {
        // if there is already item on same day
        item.addInterval();
        // console.log("1");
      }
      else {
        // there is a previous interval but not on same day
        var newInterval = new TimeInterval(today, domain);
        newInterval.addInterval();
        // console.log("2");
        timeIntervalList.push(newInterval);
      }
    } else {
      // If there is no interval with current date and domain, create new time interval
      var newInterval = new TimeInterval(today, domain);
      newInterval.addInterval();
      // console.log("3");
      timeIntervalList.push(newInterval);
      // console.log(newInterval);
    }
  }

  setCurrentActiveTab(domain) {
    // console.log(`[setCurrentActiveTab] setting current domain to ${domain}`);
    this.closeIntervalForCurrentTab();
    currentTab = domain;
    this.addTimeInterval(domain);
  }

  clearCurrentActiveTab() {
    // console.log('[clearCurrentActiveTab] running');
    this.closeIntervalForCurrentTab();
    currentTab = '';
  }
  closeIntervalForCurrentTab() {
    // console.log(`[closeIntervalForCurrentTab] ${currentTab}`);
    // Stop interval for tab item
    if (currentTab !== '' && timeIntervalList != undefined) {
      var item = timeIntervalList.find(o => o.domain === currentTab && o.day == getToday());
      if (item != undefined)
        item.closeInterval();
    }
    currentTab = '';
    // console.log(`[closeIntervalForCurrentTab] finished running ${currentTab}`);
  }

  // isNeedNotifyView(domain, tab) {
  //   // are there any notifications we need to show?
  //   if (setting_notification_list !== undefined && setting_notification_list.length > 0) {
  //     var item = setting_notification_list.find(o => isDomainEquals(this.extractHostname(o.domain), this.extractHostname(domain)));
  //     if (item !== undefined) {
  //       var today = new Date().toLocaleDateString("en-US");
  //       var data = tab.days.find(x => x.date == today);
  //       if (data !== undefined) {
  //         var todayTimeUse = data.summary;
  //         if (todayTimeUse == item.time || todayTimeUse % item.time == 0) {
  //           console.log("Notify view!!");
  //           return true;
  //         }
  //       }
  //     }
  //   }
  //   return false;
  // }
}