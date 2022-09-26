
// start := 先頭三連単id　end:=最後尾id
async function SantanPurchase(row,columun,race_num,num_of_horses,santan,start,end,driver){

    if(santan.length<=0){
        console.log("santan is not gonna be purchased");
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

        // 券種選択（三連単）
        for(let i=0;i<6;i++)driver.findElement(By.xpath(odds_type_change_xpath)).sendKeys(Key.DOWN);
        await driver.findElement(By.xpath(odds_type_change_xpath)).sendKeys(Key.ENTER);
        await _sleep(sleep_time);
    }catch(erro){
        console.log("failed to go to race page");
        console.log(erro);
        home_xpath = "//*[@id=\"ipat-navbar\"]/div/div[1]/a/h1/img";
        await driver.findElement(By.xpath(home_xpath)).click();
        return false;
    }

    let first_tmp = -1;
    try{
        // 購入馬券の選択
        for(let i=start;i<end;i++){
            let first = santan[i].umaban1;
            let second = santan[i].umaban2;
            let third = santan[i].umaban3;

            let selector = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/div/div[2]/div[2]/div[2]/select";
            // 軸馬決定フェーズ
            if(first!=first_tmp){
                driver.findElement(By.xpath(selector)).sendKeys(Key.ENTER);
                _sleep(2000);

                // 毎回一番上に戻る
                for(let i=0;i<num_of_horses;i++){
                    await driver.findElement(By.xpath(selector)).sendKeys(Key.UP);
                }
                for(let i=1;i<first;i++){
                    await driver.findElement(By.xpath(selector)).sendKeys(Key.DOWN);
                }
                await driver.findElement(By.xpath(selector)).sendKeys(Key.ENTER);
                await _sleep(1000);
            }
            // 微調整
            if(second > first){
                second--;
            }
            if(third > first){
                third--;
            }

            // 購入馬券のXpath
            let xpath = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/div/span/span/bet-odds-type-trifecta-basic/div/div/div[2]/div["+ String(second) +"]/div[2]/div["+ String(third+1)+ "]/div[2]/button";
            await driver.findElement(By.xpath(xpath)).sendKeys(Key.ENTER);
            first_tmp = first;

            // セットボタンを一回一回押す(ここでバグが起こる可能性あり)
            // いちいち押さなくても大丈夫なのかをチェックしたいどういう順番になるのか？
            let SetXpath = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/div/span/span/bet-odds-type-trifecta-basic/div/div/select-list/div/div/div[3]/div[4]/button[1]";
            await driver.findElement(By.xpath(SetXpath)).sendKeys(Key.ENTER);
            await _sleep(200); // 寝かせなくてもうまく行けるなら寝かせないほうがいい
        }

        // 金額入力UIへ遷移
        let PurListXpath = "/html/body/div[1]/ui-view/navbar/div/div/ng-transclude/div/ul/li/button";
        driver.findElement(By.xpath(PurListXpath)).click();
        await _sleep(1000);

        // 金額入力
        let sum = 0;
        for(let i=start;i<end;i++){
            let InputXpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr["+ String(i+1-start) +"]/td[5]/div/input";
            let money = Div100(santan[i].money);
            sum+=money;
            await driver.findElement(By.xpath(InputXpath)).sendKeys(String(money));
        }

        // 合計金額の入力
        let sum_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" +String(end+3-start) + "]/td/input";
        driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));

        // 購入ボタンを押して購入
        purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" + String(end+4-start) + "]/td/button"
        driver.findElement(By.xpath(purchase_button_xpath)).click();
        await _sleep(2000);
        
        if(!is_test){
            // 最終確認
            let last_decision_button = "/html/body/error-window/div/div/div[3]/button[1]"
            driver.findElement(By.xpath(last_decision_button)).click();
        }
        else{
            // キャンセル
            let cancel_button_xpath = "/html/body/error-window/div/div/div[3]/button[2]";
            driver.findElement(By.xpath(cancel_button_xpath)).click();
        }
    }catch(erro){
        console.log("something went wrong during buying santan tickets");
        console.log(erro);
        // 購入予定だった馬券をすべてクリアして初期画面に戻る
        home_xpath = "//*[@id=\"ipat-navbar\"]/div/div[1]/a/h1/img";
        await driver.findElement(By.xpath(home_xpath)).click();
        return false;
    }
    finally{
        home_xpath = "//*[@id=\"ipat-navbar\"]/div/div[1]/a/h1/img";
        await driver.findElement(By.xpath(home_xpath)).click();
    }
    

}
