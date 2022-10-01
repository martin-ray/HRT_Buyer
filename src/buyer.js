
// お客様の投票を受け付けました。
// //*[@id="ipat-navbar"]/div/ng-transclude/bet-list/div[1]/bet-list-result/div/sticky-scroll/div/h2/text()
// //*[@id="ipat-navbar"]/div/ng-transclude/bet-list/div[1]/bet-list-result/div/sticky-scroll/div/h2/text()
//*[@id="ipat-navbar"]/div/ng-transclude/bet-list/div[1]/bet-list-result/div/sticky-scroll/div/h2/text()
////*[@id="ipat-navbar"]/div/ng-transclude/bet-list/div[1]/bet-list-result/div/sticky-scroll/div/h2/text()
// が来るはずなんです。購入がうまく行くと。これが来なかったら購入がうまく行っていないということになるので、
// 買い直しになります。よろしく。

////*[@id="ipat-navbar"]/div/ng-transclude/bet-list/div[1]/bet-list-result/div/sticky-scroll/div/h2

//The result of the xpath expression "//*[@id="ipat-navbar"]/div/ng-transclude/bet-list/div[1]/bet-list-result/div/sticky-scroll/div/h2/text()" is: [object Text]. It should be an element.

// 投票を受付できませんでした
// /html/body/error-window/div/div/div[2]/div/text()[1]
//　の画面のOKボタン
// /html/body/error-window/div/div/div[3]/button
// okボタン=> もう一回購入　=> okボタン

// 投票結果
// //*[@id="ipat-navbar"]/div/ng-transclude/bet-list/div[1]/bet-list-result/div/sticky-scroll/div/h1/text()

// 投票履歴xpath
//*[@id="ipat-navbar"]/div/div[2]/ul/li[3]/button

// 購入予定リスト
//*[@id="ipat-navbar"]/div/ng-transclude/div/ul/li/button

// 受付できませんでした。　ー＞　OKボタン　ー＞　投票履歴xpath ー＞　購入予定ボタン ー＞（受付できませんでした/受付できました？）

//requires virtual GUI or virtual X Server when executing on no-gui env
//Xvfb :2 -screen 0 '1280x1024x16' -ac &> /dev/null &
//export DISPLAY=:2



var server = require('ws').Server;
var s = new server({port:8080});
const {Builder, By, Key, until,Capabilities, promise} = require('selenium-webdriver');

// NOTE !!
const is_test = false;

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let sleep_time = 3000

//　required information for login
var P_ARS;
var INET_ID;
var USER_NUM;
var PIN;

try{
    P_ARS = process.env.P_ARS
    INET_ID = process.env.INET_ID;
    USER_NUM = process.env.USER_NUM;
    PIN = process.env.PIN;
}
catch(error){
    console.log("Export logint information properly");
    process.exit(-1);
}


let root_url = "https://www.ipat.jra.go.jp/";

// Set up chrome driver
const capabilities = Capabilities.chrome();
capabilities.set('chromeOptions', {
    args: [
        '--headless',// 
        '--no-sandbox',
        '--disable-gpu',
        `--window-size=1980,1200`//ウインドウのサイズを指定
        // other chrome options
    ]
});

// Build multiple drivers
let num_of_drivers = 4; 
const drivers = new Array(num_of_drivers);
for(let i=0;i<num_of_drivers;i++){
    drivers[i] = new Builder().forBrowser('chrome').withCapabilities(capabilities).build(); 
}


// function which initializeis webdriver and login to JRA server.
async function driver_init(driver_main){
    
    console.log("Initalizing webdriver...")

    // login xpath
    let login_text_box_xpath = "//*[@id=\"top\"]/div[3]/div/table/tbody/tr/td[2]/div/div/form/table[1]/tbody/tr/td[2]/span/input";
    let click_button_xpath = "//*[@id=\"top\"]/div[3]/div/table/tbody/tr/td[2]/div/div/form/table[1]/tbody/tr/td[3]/p/a";

    try {
        // 初期ログイン処理
        await driver_main.get(root_url);
        await _sleep();
        await driver_main.findElement(By.xpath(login_text_box_xpath)).sendKeys(INET_ID);
        await driver_main.findElement(By.xpath(click_button_xpath)).click();
        
        //　必要情報の入力
        let user_num_input_xpath = "//*[@id=\"main_area\"]/div/div[1]/table/tbody/tr[1]/td[2]/span/input";
        let pin_input_xpath = "//*[@id=\"main_area\"]/div/div[1]/table/tbody/tr[2]/td[2]/span/input";
        let p_ars_input_xpath = "//*[@id=\"main_area\"]/div/div[1]/table/tbody/tr[3]/td[2]/span/input";
        click_button_xpath = "//*[@id=\"main_area\"]/div/div[1]/table/tbody/tr[1]/td[3]/p/a";
        await driver_main.findElement(By.xpath(user_num_input_xpath)).sendKeys(USER_NUM);
        await driver_main.findElement(By.xpath(pin_input_xpath)).sendKeys(PIN);
        await driver_main.findElement(By.xpath(p_ars_input_xpath)).sendKeys(P_ARS);
        await driver_main.findElement(By.xpath(click_button_xpath)).click();
    }
    catch(e1){
        console.log(e1);
    }
    finally{
        // do nothing
    }
    console.log("initialize complete")

}

// インターバルをもってログインするようにasync functionに
async function init_drivers(drivers){
    for(let i=0;i<num_of_drivers;i++){
        driver_init(drivers[i]);
        console.log(String(i+1) + "/" + num_of_drivers)
        await _sleep(3000);
    }
    console.log('all drivers initialized');
}

function Div100(money){
    return money/100;
}

// start := 先頭三連単id　end:=最後尾id
// finally句を設定するとreturnする前にかならずfinally句の中が実行される。
async function SantanPurchase(row,columun,race_num,num_of_horses,santan,start,end,driver){

    let buy_succeess_flag = true;

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
            let first = Number(santan[i].umaban1);
            let second = Number(santan[i].umaban2);
            let third = Number(santan[i].umaban3);

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
            await _sleep(100); // 寝かせなくてもうまく行けるなら寝かせないほうがいい
        }

        // 金額入力UIへ遷移
        let PurListXpath = "/html/body/div[1]/ui-view/navbar/div/div/ng-transclude/div/ul/li/button";
        await driver.findElement(By.xpath(PurListXpath)).click();
        await _sleep(3000);

        // 金額入力
        let sum = 0;
        let div_num = 5;
        for(let i=start;i<end;i++){
            let money = Div100(santan[i].money);
            sum+=money;
            try{
                let InputXpath = "//*[@id=\"bet-list-top\"]/div["+ String(div_num)+ "]/table/tbody/tr["+ String(i+1-start) +"]/td[5]/div/input";
                await driver.findElement(By.xpath(InputXpath)).sendKeys(String(money));
            }
            catch(error){
                console.log("next try");
                try{
                    let InputXpath = "//*[@id=\"bet-list-top\"]/div["+ String(Number(div_num)+1)+ "]/table/tbody/tr["+ String(i+1-start) +"]/td[5]/div/input";
                    let money = Div100(santan[i].money);
                    await driver.findElement(By.xpath(InputXpath)).sendKeys(String(money));
                }catch(error){
                    console.log("next try2");
                    try{
                        let InputXpath = "//*[@id=\"bet-list-top\"]/div["+ String(Number(div_num)+2)+ "]/table/tbody/tr["+ String(i+1-start) +"]/td[5]/div/input";
                        let money = Div100(santan[i].money);
                        await driver.findElement(By.xpath(InputXpath)).sendKeys(String(money));
                    }catch(error){
                        console.log(error);
                    }
                }
            }

        }

        // 合計金額の入力
        try{
            let sum_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" +String(end+3-start) + "]/td/input";
            await driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));
        }
        catch(error){
            console.log("sum xpath second try");
            try{
                sum_xpath = "//*[@id=\"bet-list-top\"]/div[6]/table/tbody/tr[" +String(end+3-start) + "]/td/input";
                await driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));
            }catch(error){
                console.log("sum xpath third try")
                try{
                    sum_xpath = "//*[@id=\"bet-list-top\"]/div[7]/table/tbody/tr[" +String(end+3-start) + "]/td/input";
                    await driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));
                }catch(error){

                }
                
            }
        }


        // 購入ボタンを押して購入
        try{
            let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" + String(end+4-start) + "]/td/button"
            await driver.findElement(By.xpath(purchase_button_xpath)).click();
        }catch(error){
            console.log("santan purchase button click second try");
            try{
                let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[6]/table/tbody/tr[" + String(end+4-start) + "]/td/button"
                await driver.findElement(By.xpath(purchase_button_xpath)).click();
            }
            catch(error){
                console.log("santan purchase button click third try");
                try{
                    let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[7]/table/tbody/tr[" + String(end+4-start) + "]/td/button"
                    await driver.findElement(By.xpath(purchase_button_xpath)).click();
                }
                catch(error){

                }
            }

        }
        await _sleep(2000);

        let is_purchase_completed = false;

        if(!is_test){
            // 最終確認
            let last_decision_button = "/html/body/error-window/div/div/div[3]/button[1]"
            await driver.findElement(By.xpath(last_decision_button)).click();
            await _sleep(sleep_time);

            // 購入が成功したか確認
            try{
                let check_if_success_xpath = "//*[@id=\"ipat-navbar\"]/div/ng-transclude/bet-list/div[1]/bet-list-result/div/sticky-scroll/div/h2"
                let text = await driver.findElement(By.xpath(check_if_success_xpath)).getText();
                console.log("the text is ");
                console.log(text);
                if(text=="お客様の投票を受け付けました。"){
                    console.log("tanshou purchase success");
                    is_purchase_completed = true;
                    return true;// この前にfinally が実行される
                }
                else{
                    // 失敗　個々でその流れに入ろう
                    // コードがここに来ることはない。
                }
            }
            catch(error){
                // 成功していない場合はもう一度チャレンジ
                console.log("Get caught by duplication check");
                while(!is_purchase_completed){
                    try{
                        let ok_button = "/html/body/error-window/div/div/div[3]/button";
                        let history_xpath = "//*[@id=\"ipat-navbar\"]/div/div[2]/ul/li[3]/button"
                        let purchase_list_xpaht = "//*[@id=\"ipat-navbar\"]/div/ng-transclude/div/ul/li/button"
                        await driver.findElement(By.xpath(ok_button)).click();
                        await _sleep(2000);
                        await driver.findElement(By.xpath(history_xpath));
                        await _sleep(2000);
                        await driver.findElement(By.xpath(purchase_list_xpaht));
                        await _sleep(2000);
    
    
                        // 合計金額の再入力
                        try{
                            let sum_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" +String(end+3-start) + "]/td/input";
                            await driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));
                        }
                        catch(error){
                            console.log("sum xpath second try");
                            try{
                                sum_xpath = "//*[@id=\"bet-list-top\"]/div[6]/table/tbody/tr[" +String(end+3-start) + "]/td/input";
                                await driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));
                            }catch(error){
                                console.log("sum xpath third try")
                                try{
                                    sum_xpath = "//*[@id=\"bet-list-top\"]/div[7]/table/tbody/tr[" +String(end+3-start) + "]/td/input";
                                    await driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));
                                }catch(error){
                                    return false;
                                }
                                
                            }
                        }
    
                        // 購入ボタンクリック
                        try{
                            let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" + String(end+4-start) + "]/td/button"
                            await driver.findElement(By.xpath(purchase_button_xpath)).click();
                        }catch(error){
                            console.log("santan purchase button click second try");
                            try{
                                let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[6]/table/tbody/tr[" + String(end+4-start) + "]/td/button"
                                await driver.findElement(By.xpath(purchase_button_xpath)).click();
                            }
                            catch(error){
                                console.log("santan purchase button click third try");
                                try{
                                    let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[7]/table/tbody/tr[" + String(end+4-start) + "]/td/button"
                                    await driver.findElement(By.xpath(purchase_button_xpath)).click();
                                }
                                catch(error){
                
                                }
                            }
                
                        }

                        // 購入が完了したか確認
                        try{
                            let check_if_success_xpath = "//*[@id=\"ipat-navbar\"]/div/ng-transclude/bet-list/div[1]/bet-list-result/div/sticky-scroll/div/h2"
                            let text = await driver.findElement(By.xpath(check_if_success_xpath)).getText();
                            console.log("the text is ");
                            console.log(text);
                            if(text=="お客様の投票を受け付けました。"){
                                console.log("tanshou purchase success");
                                is_purchase_completed = true;
                                return true;// この前にfinally が実行される
                            }
                            else{
                                // 失敗　個々でその流れに入ろう
                                // コードがここに来ることはない。
                            }
                        }
                        catch(error){
                            console.log("まだオッケーは出せないかなあー！");
                        }
                    }catch(error){
                        console.log("failed to buy again");
                    }  
                }

            }
        }
        else{
            // キャンセル
            let cancel_button_xpath = "/html/body/error-window/div/div/div[3]/button[2]";
            await driver.findElement(By.xpath(cancel_button_xpath)).click();
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

// 単勝購入関数
async function TanPurchase(row,columun,race_num,num_of_horses,tan,driver){

    if(tan.length<=0){
        console.log("No tanshou ticket's gonna be purchased");
        return true;
    }

    // 馬券選択画面への遷移
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

    }catch(erro){
        console.log("failed to go to race page");
        console.log(erro);
        home_xpath = "//*[@id=\"ipat-navbar\"]/div/div[1]/a/h1/img";
        await driver.findElement(By.xpath(home_xpath)).click();
        return false;
    }


    let sum = 0
    try{
        for(let i=0;i<tan.length;i++){
            let umaban = Number(tan[i].umaban1);
            let xpath = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/div/span/span/bet-odds-type-winplace-basic/div/div/table/tbody/tr["+ String(umaban) +"]/td[3]/button";
            await driver.findElement(By.xpath(xpath)).sendKeys(Key.ENTER);
            let SetXpath = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/div/span/span/bet-odds-type-winplace-basic/div/div/select-list/div/div/div[3]/div[4]/button[1]";
            await driver.findElement(By.xpath(SetXpath)).click();
            await _sleep(500);
        }
        await _sleep(3000);

        // // セットボタン
        // let SetXpath = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/div/span/span/bet-odds-type-winplace-basic/div/div/select-list/div/div/div[3]/div[4]/button[1]";
        // await driver.findElement(By.xpath(SetXpath)).sendKeys(Key.ENTER);
        // await _sleep(20); // 寝かせなくてもうまく行けるなら寝かせないほうがいい

        // 金額入力UIへ遷移
        let PurListXpath = "/html/body/div[1]/ui-view/navbar/div/div/ng-transclude/div/ul/li/button";
        await driver.findElement(By.xpath(PurListXpath)).click();
        await _sleep(1000);

        // 各券の金額を入力
        for(let i=0;i<tan.length;i++){
            ////*[@id="bet-list-top"]/div[5]/table/tbody/tr[1]/td[5]/div/input
            let InputXpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr["+ String(i+1)+"]/td[5]/div/input";
            let money = Div100(tan[i].money);
            sum += money;
            await driver.findElement(By.xpath(InputXpath)).sendKeys(String(money));
        }

        // 合計金額の入力
        //*[@id="bet-list-top"]/div[5]/table/tbody/tr[5]/td/input
        let sum_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" + String(tan.length+3) + "]/td/input";
        await driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));

        // 購入ボタン
        let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" + String(tan.length+4) + "]/td/button";
        await driver.findElement(By.xpath(purchase_button_xpath)).click();
        await _sleep(2000);



        if(!is_test){
            // 最終確認
            let last_decision_button = "/html/body/error-window/div/div/div[3]/button[1]"
            await driver.findElement(By.xpath(last_decision_button)).click();
            await _sleep(sleep_time);

            // 購入が成功したか確認
            let is_purchase_completed = false;
            try{
                let check_if_success_xpath = "//*[@id=\"ipat-navbar\"]/div/ng-transclude/bet-list/div[1]/bet-list-result/div/sticky-scroll/div/h2"
                let text = await driver.findElement(By.xpath(check_if_success_xpath)).getText();
                console.log("the text is ");
                console.log(text);
                if(text=="お客様の投票を受け付けました。"){
                    console.log("tanshou purchase success");
                    is_purchase_completed = true;
                    return true;// この前にfinally が実行される
                }
                else{
                    // 失敗　個々でその流れに入ろう
                    // コードがここに来ることはない。
                }
            }
            catch(error){
                // 成功していない場合はもう一度チャレンジ
                console.log("Get caught by duplication check");
                while(!is_purchase_completed){
                    try{
                        let ok_button = "/html/body/error-window/div/div/div[3]/button";
                        let history_xpath = "//*[@id=\"ipat-navbar\"]/div/div[2]/ul/li[3]/button"
                        let purchase_list_xpaht = "//*[@id=\"ipat-navbar\"]/div/ng-transclude/div/ul/li/button"
                        await driver.findElement(By.xpath(ok_button)).click();
                        await _sleep(2000);
                        await driver.findElement(By.xpath(history_xpath));
                        await _sleep(2000);
                        await driver.findElement(By.xpath(purchase_list_xpaht));
                        await _sleep(2000);
    
    
                        // 合計金額の再入力
                        //*[@id="bet-list-top"]/div[5]/table/tbody/tr[5]/td/input
                        let sum_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" + String(tan.length+3) + "]/td/input";
                        await driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));
    
                        // 購入ボタンクリック
                        let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" + String(tan.length+4) + "]/td/button";
                        await driver.findElement(By.xpath(purchase_button_xpath)).click();
                        await _sleep(2000);

                        // 購入が完了したか確認
                        try{
                            let check_if_success_xpath = "//*[@id=\"ipat-navbar\"]/div/ng-transclude/bet-list/div[1]/bet-list-result/div/sticky-scroll/div/h2"
                            let text = await driver.findElement(By.xpath(check_if_success_xpath)).getText();
                            console.log("the text is ");
                            console.log(text);
                            if(text=="お客様の投票を受け付けました。"){
                                console.log("tanshou purchase success");
                                is_purchase_completed = true;
                                return true;// この前にfinally が実行される
                            }
                            else{
                                // 失敗　個々でその流れに入ろう
                                // コードがここに来ることはない。
                            }
                        }
                        catch(error){
                            console.log("まだオッケーは出せないかなあー！");
                        }
                    }catch(error){
                        console.log("failed to buy again");
                    }  
                }

            }
        }
        else{
            // キャンセル
            let cancel_button_xpath = "/html/body/error-window/div/div/div[3]/button[2]";
            await driver.findElement(By.xpath(cancel_button_xpath)).click();
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

//　馬連購入関数 
async function RenPurchase(row,columun,race_num,num_of_horses,ren,driver){

    if(ren.length<=0){
        console.log("Umaren is not gonna be purchased")
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

        // 券種選択（馬連）
        for(let i=0;i<2;i++)driver.findElement(By.xpath(odds_type_change_xpath)).sendKeys(Key.DOWN);
        await driver.findElement(By.xpath(odds_type_change_xpath)).sendKeys(Key.ENTER);
        await _sleep(sleep_time);
    }catch(erro){
        console.log("failed to go to race page");
        console.log(erro);
        home_xpath = "//*[@id=\"ipat-navbar\"]/div/div[1]/a/h1/img";
        await driver.findElement(By.xpath(home_xpath)).click();
        return false;
    }

    let sum = 0;

    try{
        for(let i=0;i<ren.length;i++){
            let umaban1 = Number(ren[i].umaban1);
            let umaban2 = Number(ren[i].umaban2);
            console.log("umaban1 = " + umaban1 + "umaban2 = " + umaban2);
            if(umaban1 > umaban2){
                let tmp = umaban1;
                umaban1 = umaban2;
                umaban2 = tmp;
            }
            console.log("umaban1 = " + umaban1 + "umaban2 = " + umaban2);
            let xpath = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/div/span/span/bet-odds-type-quinella-basic/div/div/div[1]/div[" + String(umaban1)+ "]/div/div["+ String(Number(umaban2)-Number(umaban1)+1)+ "]/div[2]/button";
            await _sleep(200);
            await driver.findElement(By.xpath(xpath)).sendKeys(Key.ENTER);
        }

        // セットボタン
        let SetXpath = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/div/span/span/bet-odds-type-quinella-basic/div/div/select-list/div/div/div[3]/div[4]/button[1]";
        await driver.findElement(By.xpath(SetXpath)).sendKeys(Key.ENTER);
        await _sleep(20); // 寝かせなくてもうまく行けるなら寝かせないほうがいい

        // 金額入力UIへ遷移
        let PurListXpath = "/html/body/div[1]/ui-view/navbar/div/div/ng-transclude/div/ul/li/button";
        driver.findElement(By.xpath(PurListXpath)).click();
        await _sleep(1000);

        // 各券の金額を入力
        let div_num = 5;
        for(let i=0;i<ren.length;i++){
            let money = Div100(ren[i].money);
            sum += money;
            try{
                let InputXpath = "//*[@id=\"bet-list-top\"]/div[" +String(div_num)+ "]/table/tbody/tr["+ String(i+1) +"]/td[5]/div/input";
                await driver.findElement(By.xpath(InputXpath)).sendKeys(String(money));
            }
            catch(error){
                console.log("umaren money input second try");
                try{
                    let InputXpath = "//*[@id=\"bet-list-top\"]/div[" +String(Number(div_num) + 1)+ "]/table/tbody/tr["+ String(i+1) +"]/td[5]/div/input";
                    await driver.findElement(By.xpath(InputXpath)).sendKeys(String(money));
                }
                catch(error){
                    console.log("umaren money input third try");
                    try{
                        let InputXpath = "//*[@id=\"bet-list-top\"]/div[" +String(Number(div_num) + 2)+ "]/table/tbody/tr["+ String(i+1) +"]/td[5]/div/input";
                        await driver.findElement(By.xpath(InputXpath)).sendKeys(String(money));
                    }
                    catch(error){

                    }
                }
            }

        }

        // 合計金額の入力
        try{
            let sum_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" +String(ren.length+3)+ "]/td/input"
            await driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));
        }
        catch(error){
            console.log("sum xpath second try");
            try{
                sum_xpath = "//*[@id=\"bet-list-top\"]/div[6]/table/tbody/tr[" +String(ren.length+3)+ "]/td/input"
                await driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));
            }catch(error){
                console.log("sum xpath third try")
                try{
                    sum_xpath = "//*[@id=\"bet-list-top\"]/div[7]/table/tbody/tr[" +String(ren.length+3)+ "]/td/input"
                    await driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));
                }catch(error){

                }
                
            }
        }

        // 購入ボタンクリック
        try{
            let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" +String(ren.length+4)+ "]/td/button";
            await driver.findElement(By.xpath(purchase_button_xpath)).click();
        }catch(error){
            console.log("umaren purchase button click second try");
            try{
                let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[6]/table/tbody/tr[" +String(ren.length+4)+ "]/td/button";
                await driver.findElement(By.xpath(purchase_button_xpath)).click();
            }
            catch(error){
                console.log("umaren purchase button click third try");
                try{
                    let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[7]/table/tbody/tr[" +String(ren.length+4)+ "]/td/button";
                    await driver.findElement(By.xpath(purchase_button_xpath)).click();
                }
                catch(error){

                }
            }

        }
        await _sleep(2000);


        if(!is_test){
            // 購入確定ボタンを押す
            let last_decision_button = "/html/body/error-window/div/div/div[3]/button[1]"
            await driver.findElement(By.xpath(last_decision_button)).click();
            await _sleep(sleep_time);

            // 購入がうまく言ったかのフラグ
            let is_purchase_completed = false;
            try{
                let check_if_success_xpath = "//*[@id=\"ipat-navbar\"]/div/ng-transclude/bet-list/div[1]/bet-list-result/div/sticky-scroll/div/h2"
                let text = await driver.findElement(By.xpath(check_if_success_xpath)).getText();
                console.log("the text is ");
                console.log(text);
                if(text=="お客様の投票を受け付けました。"){
                    console.log("umaren purchase success");
                    is_purchase_completed = true;
                    return true;// この前にfinally が実行される
                }
                else{
                    // 失敗　個々でその流れに入ろう
                    // コードがここに来ることはない。
                }
            }
            catch(error){
                // 成功していない場合はもう一度チャレンジ
                console.log("Get caught by duplication check");
                while(!is_purchase_completed){
                    try{
                        let ok_button = "/html/body/error-window/div/div/div[3]/button";
                        let history_xpath = "//*[@id=\"ipat-navbar\"]/div/div[2]/ul/li[3]/button"
                        let purchase_list_xpaht = "//*[@id=\"ipat-navbar\"]/div/ng-transclude/div/ul/li/button"
                        await driver.findElement(By.xpath(ok_button)).click();
                        await _sleep(2000);
                        await driver.findElement(By.xpath(history_xpath));
                        await _sleep(2000);
                        await driver.findElement(By.xpath(purchase_list_xpaht));
                        await _sleep(2000);
    
    
                        // 合計金額の再入力
                        try{
                            let sum_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" +String(ren.length+3)+ "]/td/input"
                            await driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));
                        }
                        catch(error){
                            console.log("sum xpath second try");
                            try{
                                sum_xpath = "//*[@id=\"bet-list-top\"]/div[6]/table/tbody/tr[" +String(ren.length+3)+ "]/td/input"
                                await driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));
                            }catch(error){
                                console.log("sum xpath third try")
                                try{
                                    sum_xpath = "//*[@id=\"bet-list-top\"]/div[7]/table/tbody/tr[" +String(ren.length+3)+ "]/td/input"
                                    await driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));
                                }catch(error){

                                }
                                
                            }
                        }
    
                        // 購入ボタンクリック
                        try{
                            let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" +String(ren.length+4)+ "]/td/button";
                            await driver.findElement(By.xpath(purchase_button_xpath)).click();
                        }catch(error){
                            console.log("umaren purchase button click second try");
                            try{
                                let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[6]/table/tbody/tr[" +String(ren.length+4)+ "]/td/button";
                                await driver.findElement(By.xpath(purchase_button_xpath)).click();
                            }
                            catch(error){
                                console.log("umaren purchase button click third try");
                                try{
                                    let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[7]/table/tbody/tr[" +String(ren.length+4)+ "]/td/button";
                                    await driver.findElement(By.xpath(purchase_button_xpath)).click();
                                }
                                catch(error){

                                }
                            }

                        }

                        // 購入が完了したか確認
                        try{
                            let check_if_success_xpath = "//*[@id=\"ipat-navbar\"]/div/ng-transclude/bet-list/div[1]/bet-list-result/div/sticky-scroll/div/h2"
                            let text = await driver.findElement(By.xpath(check_if_success_xpath)).getText();
                            console.log("the text is ");
                            console.log(text);
                            if(text=="お客様の投票を受け付けました。"){
                                console.log("umaren purchase success");
                                is_purchase_completed = true;
                                return true;// この前にfinally が実行される
                            }
                            else{
                                // 失敗　個々でその流れに入ろう
                                // コードがここに来ることはない。
                            }
                        }
                        catch(error){
                            console.log("まだオッケーは出せないかなあー！");
                        }
                    }catch(error){
                        console.log("failed to buy again");
                    }  
                }

            }
        }
        else{
            // キャンセルボタン
            let cancel_button_xpath = "/html/body/error-window/div/div/div[3]/button[2]";
            await driver.findElement(By.xpath(cancel_button_xpath)).click();
        }
    }
    catch(error){
        console.log("in umaren purchase func");
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
            console.log("umaban1=" + umaban1 + "umaban2=" + umaban2);
            let xpath = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/div/span/span/bet-odds-type-exacta-basic/div/div/div[1]/div[" + String(umaban1) +"]/div/div[" +String(Number(umaban2)+1) + "]/div[2]/button";
            await driver.findElement(By.xpath(xpath)).sendKeys(Key.ENTER);
        }

        await _sleep(1000);

        // 購入予定リスト遷移

        let SetXpath = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/div/span/span/bet-odds-type-exacta-basic/div/div/select-list/div/div/div[3]/div[4]/button[1]"
        await driver.findElement(By.xpath(SetXpath)).sendKeys(Key.ENTER);
        await _sleep(20); // 寝かせなくてもうまく行けるなら寝かせないほうがいい

        // 金額入力UIへ遷移
        let PurListXpath = "/html/body/div[1]/ui-view/navbar/div/div/ng-transclude/div/ul/li/button";
        await driver.findElement(By.xpath(PurListXpath)).click();
        await _sleep(1000);

        // 金額入力
        let div_num = 5;
        let sum = 0;
        for(let i=0;i<utan.length;i++){
            // //*[@id="bet-list-top"]/div[6]/table/tbody/tr[1]/td[5]/div/input
            ////*[@id="bet-list-top"]/div[5]/table/tbody/tr[18]/td[5]/div/input
            //*[@id="bet-list-top"]/div[6]/table/tbody/tr[1]/td[5]/div/input
            let money = Div100(utan[i].money);
            sum += money;
            try{
                let InputXpath = "//*[@id=\"bet-list-top\"]/div[" +String(div_num)+ "]/table/tbody/tr["+ String(i+1) +"]/td[5]/div/input";
                await driver.findElement(By.xpath(InputXpath)).sendKeys(String(money));
            }
            catch(error){
                console.log("umatan money input second try");
                try{
                    let InputXpath = "//*[@id=\"bet-list-top\"]/div[" +String(Number(div_num)+1)+ "]/table/tbody/tr["+ String(i+1) +"]/td[5]/div/input";
                    await driver.findElement(By.xpath(InputXpath)).sendKeys(String(money));
                }
                catch(error){
                    console.log("umatan money input third try");
                    try{
                        let InputXpath = "//*[@id=\"bet-list-top\"]/div[" +String(Number(div_num)+2)+ "]/table/tbody/tr["+ String(i+1) +"]/td[5]/div/input";
                        await driver.findElement(By.xpath(InputXpath)).sendKeys(String(money));
                    }
                    catch(error){

                    }
                }
            }
        }

        // 合計金額の入力
        try{
            let sum_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" +String(utan.length+3)+ "]/td/input"
            await driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));
        }
        catch(error){
            console.log("umatan sum xpath second try");
            try{
                sum_xpath = "//*[@id=\"bet-list-top\"]/div[6]/table/tbody/tr[" +String(utan.length+3)+ "]/td/input"
                await driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));
            }catch(error){
                console.log("umatan sum xpath third try")
                try{
                    sum_xpath = "//*[@id=\"bet-list-top\"]/div[7]/table/tbody/tr[" +String(utan.length+3)+ "]/td/input"
                    await driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));
                }catch(error){

                }
                
            }
        }

        // 購入ボタンクリック
        try{
            let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" +String(utan.length+4)+ "]/td/button"
            await driver.findElement(By.xpath(purchase_button_xpath)).click();
        }catch(error){
            console.log("umatan purchase button click second try");
            try{
                let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[6]/table/tbody/tr[" +String(utan.length+4)+ "]/td/button";
                await driver.findElement(By.xpath(purchase_button_xpath)).click();
            }
            catch(error){
                console.log("umatan purchase button click third try");
                try{
                    let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[7]/table/tbody/tr[" +String(utan.length+4)+ "]/td/button";
                    await driver.findElement(By.xpath(purchase_button_xpath)).click();
                }
                catch(error){

                }
            }

        }
        
        
        await _sleep(2000);

        if(!is_test){
            // 購入確定ボタンを押す
            let last_decision_button = "/html/body/error-window/div/div/div[3]/button[1]"
            await driver.findElement(By.xpath(last_decision_button)).click();
            await _sleep(sleep_time);

            // 購入がうまく言ったかのフラグ
            let is_purchase_completed = false;
            try{
                let check_if_success_xpath = "//*[@id=\"ipat-navbar\"]/div/ng-transclude/bet-list/div[1]/bet-list-result/div/sticky-scroll/div/h2"
                let text = await driver.findElement(By.xpath(check_if_success_xpath)).getText();
                console.log("the text is ");
                console.log(text);
                if(text=="お客様の投票を受け付けました。"){
                    console.log("umatan purchase success");
                    is_purchase_completed = true;
                    return true;// この前にfinally が実行される
                }
                else{
                    // 失敗　個々でその流れに入ろう
                    // コードがここに来ることはない。
                }
            }
            catch(error){
                // 成功していない場合はもう一度チャレンジ
                console.log("Get caught by duplication check");
                while(!is_purchase_completed){
                    try{
                        let ok_button = "/html/body/error-window/div/div/div[3]/button";
                        let history_xpath = "//*[@id=\"ipat-navbar\"]/div/div[2]/ul/li[3]/button"
                        let purchase_list_xpaht = "//*[@id=\"ipat-navbar\"]/div/ng-transclude/div/ul/li/button"
                        await driver.findElement(By.xpath(ok_button)).click();
                        await _sleep(2000);
                        await driver.findElement(By.xpath(history_xpath));
                        await _sleep(2000);
                        await driver.findElement(By.xpath(purchase_list_xpaht));
                        await _sleep(2000);
    
                
                        // 合計金額の際入力
                        try{
                            let sum_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" +String(utan.length+3)+ "]/td/input"
                            await driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));
                        }
                        catch(error){
                            console.log("umatan sum xpath second try");
                            try{
                                sum_xpath = "//*[@id=\"bet-list-top\"]/div[6]/table/tbody/tr[" +String(utan.length+3)+ "]/td/input"
                                await driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));
                            }catch(error){
                                console.log("umatan sum xpath third try")
                                try{
                                    sum_xpath = "//*[@id=\"bet-list-top\"]/div[7]/table/tbody/tr[" +String(utan.length+3)+ "]/td/input"
                                    await driver.findElement(By.xpath(sum_xpath)).sendKeys(String(sum*100));
                                }catch(error){

                                }
                                
                            }
                        }
    

                        // 購入ボタンクリック
                        try{
                            let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[5]/table/tbody/tr[" +String(utan.length+4)+ "]/td/button"
                            await driver.findElement(By.xpath(purchase_button_xpath)).click();
                        }catch(error){
                            console.log("umatan purchase button click second try");
                            try{
                                let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[6]/table/tbody/tr[" +String(utan.length+4)+ "]/td/button";
                                await driver.findElement(By.xpath(purchase_button_xpath)).click();
                            }
                            catch(error){
                                console.log("umatan purchase button click third try");
                                try{
                                    let purchase_button_xpath = "//*[@id=\"bet-list-top\"]/div[7]/table/tbody/tr[" +String(utan.length+4)+ "]/td/button";
                                    await driver.findElement(By.xpath(purchase_button_xpath)).click();
                                }
                                catch(error){

                                }
                            }

                        }

                        // 購入が完了したか確認
                        try{
                            let check_if_success_xpath = "//*[@id=\"ipat-navbar\"]/div/ng-transclude/bet-list/div[1]/bet-list-result/div/sticky-scroll/div/h2"
                            let text = await driver.findElement(By.xpath(check_if_success_xpath)).getText();
                            console.log("the text is ");
                            console.log(text);
                            if(text=="お客様の投票を受け付けました。"){
                                console.log("umatan purchase success");
                                is_purchase_completed = true;
                                return true;// この前にfinally が実行される
                            }
                            else{
                                // 失敗　個々でその流れに入ろう
                                // コードがここに来ることはない。
                            }
                        }
                        catch(error){
                            console.log("まだオッケーは出せないかなあー！");
                        }
                    }catch(error){
                        console.log("failed to buy again");
                    }  
                }

            }
        }
        else{
            // キャンセルボタン
            let cancel_button_xpath = "/html/body/error-window/div/div/div[3]/button[2]";
            await driver.findElement(By.xpath(cancel_button_xpath)).click();
        }
    }
    catch(error){
        console.log("in umatan purchase func");
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

// ワイド購入関数
async function WidePurchase(row,columun,race_num,num_of_horses,wide,driver){

    if(wide.length<=0){
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

        // 券種選択（ワイド）
        for(let i=0;i<3;i++)driver.findElement(By.xpath(odds_type_change_xpath)).sendKeys(Key.DOWN);
        await driver.findElement(By.xpath(odds_type_change_xpath)).sendKeys(Key.ENTER);
        await _sleep(sleep_time);
    }catch(erro){
        console.log("failed to go to race page in wide purchase function");
        console.log(erro);
        home_xpath = "//*[@id=\"ipat-navbar\"]/div/div[1]/a/h1/img";
        await driver.findElement(By.xpath(home_xpath)).click();
        return false;
    }

    let sum = 0;

    try{
        for(let i=0;i<wide.length;i++){
            let umaban1 = wide[i].umaban1;
            let umaban2 = wide[i].umaban2;
            if(umaban1 > umaban2){
                let tmp = umaban1;
                umaban1 = umaban2;
                umaban2 = tmp;
            }            
            let xpath = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/div/span/span/bet-odds-type-quinellaplace-basic/div/div/div[1]/div[" + String(umaban1)+ "]/div/div["+ String(umaban2-umaban1+1)+ "]/div[2]/button";
            driver.findElement(By.xpath(xpath)).sendKeys(Key.ENTER);
        }

        // セットボタン   
        let SetXpath = "//*[@id=\"main\"]/ui-view/div[2]/ui-view/ui-view/main/div/span/span/bet-odds-type-quinellaplace-basic/div/div/select-list/div/div/div[3]/div[4]/button[1]";
        await driver.findElement(By.xpath(SetXpath)).sendKeys(Key.ENTER);
        await _sleep(20); // 寝かせなくてもうまく行けるなら寝かせないほうがいい

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
        console.log("in umaren purchase func");
        console.log(error);
        home_xpath = "//*[@id=\"ipat-navbar\"]/div/div[1]/a/h1/img";
        await driver.findElement(By.xpath(home_xpath)).click();
        return false;
    }
    finally{

    }
}


// 上記関数を実行する関数
async function buyer(TicketData){
    // 購入に成功したらtrueを、失敗したらfalseを返す。
    baba_id = TicketData.baba_id;
    race_num = TicketData.race_num;
    column = TicketData.column;
    num_of_horses = TicketData.num_of_horses;
    santan_num = TicketData.santan.length;
    console.log(race_num , column, num_of_horses);
    console.log(TicketData.tanshou);

    // buy tickets
    santan_flag = SantanPurchase(1,column,race_num,num_of_horses,TicketData.santan,0,santan_num,drivers[0])
    tanshou_flag = TanPurchase(1,column,race_num,num_of_horses,TicketData.tanshou,drivers[1]);
    umatan_flag = UtanPurchase(1,column,race_num,num_of_horses,TicketData.umatan,drivers[2]);
    umaren_flag = RenPurchase(1,column,race_num,num_of_horses,TicketData.umaren,drivers[3]);
    // fukushou_flag = FukushouPurchase(1,column,race_num,num_of_horses,TicketData.fuku,drivers[4]);
    // wide_flag = WidePurchase(1,column,race_num,num_of_horses,TicketData.wide,driver[5]);

    await Promise.all([santan_flag,tanshou_flag,umatan_flag,umaren_flag]).then((result)=>{
        let re_santan_flag;
        let re_tanshou_flag;
        let re_umatan_flag;
        let re_umaren_flag;
        if(!santan_flag){
            console.log("try buying santan again")
            re_santan_flag = SantanPurchase(1,column,race_num,num_of_horses,TicketData.santan,0,santan_num,drivers[0])
        }

        if(!tanshou_flag){
            console.log("try buying tanshou again")
            re_tanshou_flag = TanPurchase(1,column,race_num,num_of_horses,TicketData.tanshou,drivers[1]);
        }

        if(!umatan_flag){
            console.log("try buying umatan again")
            re_umatan_flag = UtanPurchase(1,column,race_num,num_of_horses,TicketData.umatan,drivers[2]);
        }

        if(!umaren_flag){
            console.log("try buying umaren again")
            re_umaren_flag = RenPurchase(1,column,race_num,num_of_horses,TicketData.umaren,drivers[3]);  
        }
    })

}

// 購入リクエストがまだ受付可能か？
function IsPurchasable(json){
    // 購入予定レースの馬券購入しめきりが2分 (要検討) 
    // を切っている場合は購入を受け付けない。
    return true;
}

// 送信されたJsonのバリデーションチェック
function IsJsonValid(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


// restful api format
var ticktest = {
    santan:[
        {
         umaban1:2,
         umaban2:3,
         umaban3:5,
         money:1000
        },
        {},
        {}
    ],
    sanren:[],
    tanshou:[],
    umatan:[],
    umaren:[],
    wide:[],
    fuku:[],

}


init_drivers(drivers);

//　サーバ
s.on('connection',function(ws){

    ws.on('message',function(message){
        console.log("Received: "+message);
        let json = JSON.parse(message);
        
        if(!IsJsonValid(json)){
            let ret_message = {
                m_type:"json_not_valid"
            }
            let ret = JSON.stringify(ret_message)
            ws.send(ret);
            ws.close();
        }

        if(IsPurchasable(json)){

            let flag = buyer(json);
            flag.then((result)=>{
                if(result){
                    // 購入成功
                }else{
                    // 購入失敗
                    let ret_message = {
                        m_type : "failed to purchase"
                    }
    
                    let ret = JSON.stringify(ret_message);
                    ws.send(ret);
                }
            })
        }else{
            // 時刻が過ぎているため購入が不可能
            let ret_message = {
                m_type:"time_exceeded"
            }

            let ret = JSON.stringify(ret_message);
            ws.send(ret);
            ws.close();
        }
    })

    ws.on('close',function(){
        console.log('I lost a client');
    });

});

