
// function which initializeis webdriver and login to JRA server.
async function driver_init(driver_main){

    let root_url = "https://www.ipat.jra.go.jp/";
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
    for(let i=0;i<drivers.length;i++){
        driver_init(drivers[i]);
        await _sleep(3000);
    }
    console.log('all drivers initialized');
}

function Div100(money){
    return money/100;
}


// exporting modules
module.exports = {init_drivers,driver_init,Div100}