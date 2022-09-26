# HRT_Buyer
A JSON API which buys horse race tickets(HRT) in JRA's official site(https://www.ipat.jra.go.jp)  


# How to Use
## 1. install necessary packages

1. chromedriver
2. node.js packages listed above
3. Xvfb. (This makes a virtual gui env. you need it when executing selenium driver on no gui env)


## 2. Export Environment variable for JRA's login imformation

```
export P_ARS="2222";       // 4 digits 
export INET_ID="33333ddd"; // 8 digits
export USER_NUM="1111";    // 8 digits
export PIN="1111";         // 4 digits
```
*first you need to register your information to JRA's ipat and get above information 

## 3. Start running Server

```
node buyer.js
```
*NOTE: Xvfb is required when executing on no gui environment.


# JSON format

```
// JSON format
var ticktest = {
    santan:[
        {
         umaban1:2,
         umaban2:3,
         umaban3:5,
         money:1000
        },
        {...},
        {...},
        ...
    ],
    sanren:[
         umaban1:2,
         umaban2:3,
         umaban3:5,
         money:1000
        },
        {...},
        {...}
        ...
    ],
    tanshou:[
        {
            umaban1:3,
            money:100
        },
        {...},
        ...
    ],
    umatan:[
        {
            umaban1:3,
            umaban2:5,
            money:200
        },
        {},
        ...
    ],
    umaren:[
        {
            umaban1:3,
            umaban2:9,
            money:400
        }
    ],
    wide:[
        {
            umaban1:5,
            umaban2:9,
            money:1000
        }
    ],
    fuku:[
        {
            umaban1:9,
            money:300
        }
    ],

}
```

# how to submit json
use websocket to submit the above json.

# ToDo
- [ ] implement restful API using express.js