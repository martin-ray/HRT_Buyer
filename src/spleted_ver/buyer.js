// お客様の投票を受け付けました。
// //*[@id="ipat-navbar"]/div/ng-transclude/bet-list/div[1]/bet-list-result/div/sticky-scroll/div/h2/text()
// が来るはずなんです。購入がうまく行くと。これが来なかったら購入がうまく行っていないということになるので、
// 買い直しになります。

//requires virtual GUI or virtual X Server when executing on no-gui env
//Xvfb :1 -screen 0 '1280x1024x16' -ac &> /dev/null &
//export DISPLAY=:1



var server = require('ws').Server;
var s = new server({port:8000});
const {Builder,Capabilities} = require('selenium-webdriver');

// 必要な関数をインポート
const  {SantanPurchase} = require('./santan_buyer')

// 上記関数を実行する関数
async function buyer(TicketData){
    // 購入に成功したらtrueを、失敗したらfalseを返す。
    baba_id = TicketData.baba_id;
    race_num = TicketData.race;
    column = TicketData.place;
    num_of_horses = TicketData.num_of_horses;
    santan_num = TicketData.santan.length;
    console.log(race_num , column, num_of_horses);
    console.log(TicketData.tanshou);

    // buy tickets
    santan_flag = SantanPurchase(1,column,race_num,num_of_horses,TicketData.santan,0,santan_num,drivers[0])
    tanshou_flag = TanPurchase(1,column,race_num,num_of_horses,TicketData.tanshou,drivers[1]);
    umatan_flag = UtanPurchase(1,column,race_num,num_of_horses,TicketData.umatan,drivers[2]);
    umaren_flag = RenPurchase(1,column,race_num,num_of_horses,TicketData.umaren,drivers[3]);
    fukushou_flag = FukushouPurchase(1,column,race_num,num_of_horses,TicketData.fuku,drivers[4]);
    wide_flag = WidePurchase(1,column,race_num,num_of_horses,TicketData.wide,driver[5]);

    await Promise.all([santan_flag,tanshou_flag,umatan_flag,umaren_flag]).then((result)=>{
        if(result[0]&result[1]&result[2]&result[3]){
            return true;
        }
        else{
            // 購入失敗
            return false;
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



// NOTE !!
const is_test = true;

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let sleep_time = 3000

//　required information for login
let P_ARS;
let INET_ID;
let USER_NUM;
let PIN;
try{
    P_ARS = process.env.P_ARS
    INET_ID = process.env.INET_ID;
    USER_NUM = process.env.USER_NUM;
    PIN = process.env.PIN;
}
catch(error){
    console.log(error);
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
let num_of_drivers = 7; // 18 of them are for sanrentan 2 of them are for tanshou to wide
const drivers = new Array(num_of_drivers);
for(let i=0;i<num_of_drivers;i++){
    drivers[i] = new Builder().forBrowser('chrome').withCapabilities(capabilities).build(); 
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
                    ws.close();
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

