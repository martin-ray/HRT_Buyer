

// 複勝購入関数
async function FukushouPurchase(row,column,race_num,num_of_horses,fuku,driver){

    if(fuku.length<=0){
        console.log("No fukushou ticket's gonna be purchased");
        return true;
    }

    // 馬券選択画面への遷移
    try{
        // オッズ投票画面への遷移
        let odds_vote_xpath = "//*[@id=\"main\"]/ui-view/main/div[2]/div[1]/div[2]/button";
        await driver.findElement(By.xpath(odds_vote_xpath)).click();

        // 馬場選択画面への遷移
        await _sleep(sleep_time);
        let baba_xpath = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/select-course-race/div/div[2]/div[2]/div[2]/div[" + String(row) + "]/div["+ String(column) + "]/button";
        await driver.findElement(By.xpath(baba_xpath)).click();

        // レース番号選択
        await _sleep(sleep_time);
        let race_num_xpath="//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/select-course-race/div/div[2]/div[2]/div[4]/div[" + String(race_num)+ "]/button";
        await driver.findElement(By.xpath(race_num_xpath)).click();
        await _sleep(sleep_time);

        // オッズ投票
        let odds_type_change_xpath = "//*[@id=\"bet-odds-type\"]";
        await driver.findElement(By.xpath(odds_type_change_xpath)).click();

    }catch(erro){
        console.log("failed to go to race page in fukushou purchase function ");
        console.log(erro);
        home_xpath = "//*[@id=\"ipat-navbar\"]/div/div[1]/a/h1/img";
        await driver.findElement(By.xpath(home_xpath)).click();
        return false;
    }


    let sum = 0
    try{
        for(let i=0;i<fuku.length;i++){
            let umaban = fuku[i].umaban1;
            let xpath = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/div/span/span/bet-odds-type-winplace-basic/div/div/table/tbody/tr["+ String(umaban) +"]/td[4]/button";
            driver.findElement(By.xpath(xpath)).sendKeys(Key.ENTER);
            let SetXpath = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/div/span/span/bet-odds-type-winplace-basic/div/div/select-list/div/div/div[3]/div[4]/button[1]";
            driver.findElement(By.xpath(SetXpath)).click();
            await _sleep(250);
        }
        await _sleep(5000);

        // // セットボタン
        // let SetXpath = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/div/span/span/bet-odds-type-winplace-basic/div/div/select-list/div/div/div[3]/div[4]/button[1]";
        // await driver.findElement(By.xpath(SetXpath)).sendKeys(Key.ENTER);
        // await _sleep(20); // 寝かせなくてもうまく行けるなら寝かせないほうがいい

        // 金額入力UIへ遷移
        let PurListXpath = "/html/body/div[1]/ui-view/navbar/div/div/ng-transclude/div/ul/li/button";
        driver.findElement(By.xpath(PurListXpath)).click();
        await _sleep(1000);

        // 各券の金額を入力
        for(let i=0;i<fuku.length;i++){
            let InputXpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr["+ String(i+1)+"]/td[5]/div/input";
            let money = Div100(fuku[i].money);
            sum += money;
            driver.findElement(By.xpath(InputXpath)).sendKeys(String(money));
        }

        // 合計金額の入力
        //*[@id="bet-list-top"]/div[5]/table/tbody/tr[5]/td/input
        let sum_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" + String(fuku.length+3) + "]/td/input";
        driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));

        // 購入ボタン
        let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" + String(fuku.length+4) + "]/td/button";
        driver.findElement(By.xpath(purchase_button_xpath)).click();
        await _sleep(2000);
        
        if(!is_test){
            let last_decision_button = "/html/body/error-window/div/div/div[3]/button[1]"
            driver.findElement(By.xpath(last_decision_button)).click();
        }
        else{
            // キャンセルボタン
            let cancel_button_xpath = "/html/body/error-window/div/div/div[3]/button[2]";
            driver.findElement(By.xpath(cancel_button_xpath)).click();            
        }

    }
    catch(error){
        console.log("in tanshou purchase func");
        console.log(error);
        home_xpath = "//*[@id=\"ipat-navbar\"]/div/div[1]/a/h1/img";
        await driver.findElement(By.xpath(home_xpath)).click();
        return false;
    }
    finally{
        home_xpath = "//*[@id=\"ipat-navbar\"]/div/div[1]/a/h1/img";
        await driver.findElement(By.xpath(home_xpath)).click();
    }
}
