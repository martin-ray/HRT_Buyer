

// 馬単購入関数
async function UtanPurchase(row,columun,race_num,num_of_horses,utan,driver){

    if(utan.length<=0){
        console.log("Umatan not gonna be purchased")
        return true;
    }

    try{
        // オッズ投票画面への遷移
        let odds_vote_xpath = "//*[@id=\"main\"]/ui-view/main/div[2]/div[1]/div[2]/button";
        await driver.findElement(By.xpath(odds_vote_xpath)).click();

        // 馬場選択画面への遷移
        await _sleep(sleep_time);
        let baba_xpath = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/select-course-race/div/div[2]/div[2]/div[2]/div[" + String(row) + "]/div["+ String(columun) + "]/button";
        await driver.findElement(By.xpath(baba_xpath)).click();

        // レース番号選択
        await _sleep(sleep_time);
        let race_num_xpath="//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/select-course-race/div/div[2]/div[2]/div[4]/div[" + String(race_num)+ "]/button";
        await driver.findElement(By.xpath(race_num_xpath)).click();
        await _sleep(sleep_time);

        // オッズ投票
        let odds_type_change_xpath = "//*[@id=\"bet-odds-type\"]";
        await driver.findElement(By.xpath(odds_type_change_xpath)).click();

        // 券種選択（馬単）
        for(let i=0;i<4;i++)driver.findElement(By.xpath(odds_type_change_xpath)).sendKeys(Key.DOWN);
        await driver.findElement(By.xpath(odds_type_change_xpath)).sendKeys(Key.ENTER);
        await _sleep(sleep_time);
    }catch(erro){
        console.log("failed to go to race page");
        console.log(erro);
        home_xpath = "//*[@id=\"ipat-navbar\"]/div/div[1]/a/h1/img";
        await driver.findElement(By.xpath(home_xpath)).click();
        return false;
    }

    // 購入馬券の選択
    try{
        for(let i=0;i<utan.length;i++){
            let umaban1 = utan[i].umaban1;
            let umaban2 = utan[i].umaban2;
            let xpath = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/div/span/span/bet-odds-type-exacta-basic/div/div/div[1]/div[" + String(umaban1) +"]/div/div[" +String(umaban2+1) + "]/div[2]/button";
            driver.findElement(By.xpath(xpath)).sendKeys(Key.ENTER);
        }

        await _sleep(1000);

        // 購入予定リスト遷移

        let SetXpath = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/div/span/span/bet-odds-type-exacta-basic/div/div/select-list/div/div/div[3]/div[4]/button[1]"
        await driver.findElement(By.xpath(SetXpath)).sendKeys(Key.ENTER);
        await _sleep(20); // 寝かせなくてもうまく行けるなら寝かせないほうがいい

        // 金額入力UIへ遷移
        let PurListXpath = "/html/body/div[1]/ui-view/navbar/div/div/ng-transclude/div/ul/li/button";
        driver.findElement(By.xpath(PurListXpath)).click();
        await _sleep(1000);
        // 金額入力
        let sum = 0;
        for(let i=0;i<utan.length;i++){
            let InputXpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr["+ String(i+1) +"]/td[5]/div/input";
            let money = Div100(utan[i].money);
            sum += money;
            driver.findElement(By.xpath(InputXpath)).sendKeys(String(money));
        }
        
        //let sum_xpath = "/html/body/div[1]/ui-view/navbar/div/div/ng-transclude/bet-list/div[1]/bet-list-cart/div/div[2]/div/div[4]/table/tbody/tr[" +String(utan.length+3)+"]/td/input";
        let sum_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" +String(utan.length+3)+ "]/td/input"
        driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));

        let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" +String(utan.length+4)+ "]/td/button"
        driver.findElement(By.xpath(purchase_button_xpath)).click();
        await _sleep(2000);
        
        if(!is_test){
            let last_decision_button = "/html/body/error-window/div/div/div[3]/button[1]"
            driver.findElement(By.xpath(last_decision_button)).click();
        }
        else{
            let cancel_button_xpath = "/html/body/error-window/div/div/div[3]/button[2]";
            driver.findElement(By.xpath(cancel_button_xpath)).click();
        }
    }
    catch(error){
        console.log("in umatan purchase func");
        console.log(error);
        home_xpath = "//*[@id=\"ipat-navbar\"]/div/div[1]/a/h1/img";
        await driver.findElement(By.xpath(home_xpath)).click();
        return false;
    }
}
