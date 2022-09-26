
// 三連複購入関数
async function SanpukuPurchase(row,columun,race_num,num_of_horses,sanren,driver){

    if(sanren.length<=0){
        console.log("Wide is not gonna be purchased")
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

        // 券種選択（三連複）
        for(let i=0;i<5;i++)driver.findElement(By.xpath(odds_type_change_xpath)).sendKeys(Key.DOWN);
        await driver.findElement(By.xpath(odds_type_change_xpath)).sendKeys(Key.ENTER);
        await _sleep(sleep_time);
    }catch(erro){
        console.log("failed to go to the race page in sanren purchase function");
        console.log(erro);
        home_xpath = "//*[@id=\"ipat-navbar\"]/div/div[1]/a/h1/img";
        await driver.findElement(By.xpath(home_xpath)).click();
        return false;
    }

    let sum = 0;

    try{
        for(let i=0;i<sanren.length;i++){

            // 小さい順になるようにソート
            let umaban1 = sanren[i].umaban1;
            let umaban2 = sanren[i].umaban2;
            let umaban3 = sanren[i].umaban3;
            if(umaban1 > umaban2){
                let tmp = umaban1;
                umaban1 = umaban2;
                umaban2 = tmp;
            }
            if(umaban2 > umaban3){
                let tmp = umaban2;
                umaban2 = umaban3;
                umaban3 = tmp;
            }
            if(umaban1 > umaban2){
                let tmp = umaban1;
                umaban1 = umaban2;
                umaban2 = tmp;
            }

            // 軸馬を決定する
            let selector = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/div/div[2]/div[2]/div/select";

            // 毎回一番上に戻る
            for(let i=0;i<num_of_horses;i++)driver.findElement(By.xpath(selector)).sendKeys(Key.UP);
            for(let i=0;i<umaban1;i++)driver.findElement(By.xpath(selector)).sendKeys(Key.UP);
            driver.findElement(By.xpath(selector)).sendKeys(Key.ENTER);
            let xpath = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/div/span/span/bet-odds-type-trio-basic/div/div/div[2]/div[" +String(umaban2-1)+ "]/div/div[" +String(umaban3 - umaban2 + 2)+" ]/div[2]/button";
            driver.findElement(By.xpath(xpath)).sendKeys(Key.ENTER);

            // セットボタン 
            let SetXpath = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/div/span/span/bet-odds-type-trio-basic/div/div/select-list/div/div/div[3]/div[4]/button[1]";
            await driver.findElement(By.xpath(SetXpath)).sendKeys(Key.ENTER);
            await _sleep(20); // 寝かせなくてもうまく行けるなら寝かせないほうがいい
        }



        // 金額入力UIへ遷移   //*[@id="ipat-navbar"]/div/ng-transclude/div/ul/li/button
        let PurListXpath = "//*[@id=\"ipat-navbar\"]/div/ng-transclude/div/ul/li/button";
        driver.findElement(By.xpath(PurListXpath)).click();
        await _sleep(1000);

        // 各券の金額を入力
        for(let i=0;i<ren.length;i++){
            let InputXpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr["+ String(i+1) +"]/td[5]/div/input";
            let money = Div100(ren[i].money);
            sum += money;
            driver.findElement(By.xpath(InputXpath)).sendKeys(String(money));
        }

        // 合計金額の入力
        let sum_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" +String(ren.length+3)+ "]/td/input"
        driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));

        // 購入ボタンのクリック
        let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" +String(ren.length+4)+ "]/td/button";
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
        console.log("in sanren purchase func");
        console.log(error);
        home_xpath = "//*[@id=\"ipat-navbar\"]/div/div[1]/a/h1/img";
        await driver.findElement(By.xpath(home_xpath)).click();
        return false;
    }
    finally{

    }
}
