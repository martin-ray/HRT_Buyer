//
// Copyright (c) 2016-2019 Vinnie Falco (vinnie dot falco at gmail dot com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//
// Official repository: https://github.com/boostorg/beast
//

//------------------------------------------------------------------------------
//
// Example: WebSocket client, asynchronous
//
//------------------------------------------------------------------------------

#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/asio/strand.hpp>
#include <cstdlib>
#include <functional>
#include <iostream>
#include <memory>
#include <string>
#include<nlohmann/json.hpp>

using json = nlohmann::json;

namespace beast = boost::beast;         // from <boost/beast.hpp>
namespace http = beast::http;           // from <boost/beast/http.hpp>
namespace websocket = beast::websocket; // from <boost/beast/websocket.hpp>
namespace net = boost::asio;            // from <boost/asio.hpp>
using tcp = boost::asio::ip::tcp;       // from <boost/asio/ip/tcp.hpp>

//------------------------------------------------------------------------------

// Report a failure
void
fail(beast::error_code ec, char const* what)
{
    std::cerr << what << ": " << ec.message() << "\n";
}

// Sends a WebSocket message and prints the response
class session : public std::enable_shared_from_this<session>
{
    tcp::resolver resolver_;
    websocket::stream<beast::tcp_stream> ws_;
    beast::flat_buffer buffer_;
    std::string host_;
    std::string text_;

public:
    // Resolver and socket require an io_context
    explicit
    session(net::io_context& ioc)
        : resolver_(net::make_strand(ioc))
        , ws_(net::make_strand(ioc))
    {
    }

    // Start the asynchronous operation
    void
    run(
        char const* host,
        char const* port,
        char const* text)
    {
        // Save these for later
        host_ = host;
        text_ = text;

        // Look up the domain name
        resolver_.async_resolve(
            host,
            port,
            beast::bind_front_handler(
                &session::on_resolve,
                shared_from_this()));
    }

    void
    on_resolve(
        beast::error_code ec,
        tcp::resolver::results_type results)
    {
        if(ec)
            return fail(ec, "resolve");

        // Set the timeout for the operation
        beast::get_lowest_layer(ws_).expires_after(std::chrono::seconds(30));

        // Make the connection on the IP address we get from a lookup
        beast::get_lowest_layer(ws_).async_connect(
            results,
            beast::bind_front_handler(
                &session::on_connect,
                shared_from_this()));
    }

    void
    on_connect(beast::error_code ec, tcp::resolver::results_type::endpoint_type ep)
    {
        if(ec)
            return fail(ec, "connect");

        // Turn off the timeout on the tcp_stream, because
        // the websocket stream has its own timeout system.
        beast::get_lowest_layer(ws_).expires_never();

        // Set suggested timeout settings for the websocket
        ws_.set_option(
            websocket::stream_base::timeout::suggested(
                beast::role_type::client));

        // Set a decorator to change the User-Agent of the handshake
        ws_.set_option(websocket::stream_base::decorator(
            [](websocket::request_type& req)
            {
                req.set(http::field::user_agent,
                    std::string(BOOST_BEAST_VERSION_STRING) +
                        " websocket-client-async");
            }));

        // Update the host_ string. This will provide the value of the
        // Host HTTP header during the WebSocket handshake.
        // See https://tools.ietf.org/html/rfc7230#section-5.4
        host_ += ':' + std::to_string(ep.port());

        // Perform the websocket handshake
        ws_.async_handshake(host_, "/",
            beast::bind_front_handler(
                &session::on_handshake,
                shared_from_this()));
    }

    void
    on_handshake(beast::error_code ec)
    {
        if(ec)
            return fail(ec, "handshake");
        
        // Send the message
        ws_.async_write(
            net::buffer(text_),
            beast::bind_front_handler(
                &session::on_write,
                shared_from_this()));
    }

    void
    on_write(
        beast::error_code ec,
        std::size_t bytes_transferred)
    {
        boost::ignore_unused(bytes_transferred);

        if(ec)
            return fail(ec, "write");
        
        // Read a message into our buffer
        ws_.async_read(
            buffer_,
            beast::bind_front_handler(
                &session::on_read,
                shared_from_this()));
    }

    void
    on_read(
        beast::error_code ec,
        std::size_t bytes_transferred)
    {
        boost::ignore_unused(bytes_transferred);

        if(ec)
            return fail(ec, "read");

        // Close the WebSocket connection
        ws_.async_close(websocket::close_code::normal,
            beast::bind_front_handler(
                &session::on_close,
                shared_from_this()));
    }

    void
    on_close(beast::error_code ec)
    {
        if(ec)
            return fail(ec, "close");

        // If we get here then the connection is closed gracefully

        // The make_printable() function helps print a ConstBufferSequence
        std::cout << beast::make_printable(buffer_.data()) << std::endl;
        json in_mess = json::parse(beast::buffers_to_string(buffer_.data())); 
        std::cout << "num_of_horses = " << in_mess["num_of_horses"] << std::endl;
        int num_of_horses = in_mess["num_of_horses"]; 
        std::vector<std::vector<std::vector<double>>> santan(num_of_horses+1,std::vector<std::vector<double>>(num_of_horses+1,std::vector<double>(num_of_horses+1,-1)));
        json santan_json;
        santan_json = in_mess["santan"];
        for(auto itr = santan_json.begin();itr!=santan_json.end();itr++){
            // std::cout << *itr << std::endl;
            json j2 = *itr;
            for(auto itr2=j2.begin();itr2!=j2.end();itr2++){
                json j3 = *itr2;
                for(auto itr3=j3.begin();itr3!=j3.end();itr3++){
                    std::cout << *itr3 << " ";
                }
                std::cout << std::endl;
            }

        }

        for(int i=0;i<num_of_horses;i++){
            for(int j=1;j<num_of_horses+1;j++){
                for(int k=1;k<num_of_horses+1;k++){
                    if(santan_json[i][(j)][(k)].is_null()){
                        continue;
                    }
                    else{
                        santan[i+1][j][k] = santan_json[i][(j)][(k)];
                    }
                }
            }
        }

        // for(int i=1;i<num_of_horses+1;i++){
        //     for(int j=1;j<num_of_horses+1;j++){
        //         for(int k=1;k<num_of_horses+1;k++){
        //             if(i==j||j==k||k==i){
        //                 continue;
        //             }
        //             else{
        //                 std::cout << i << ">" << j << ">" << k << ">" << "=" << santan[i][j][k] << std::endl;
        //             }
        //         }
        //     }
        // }
    }
};

//------------------------------------------------------------------------------


int main(int argc, char** argv)
{
    // Check command line arguments.
    // Check command line arguments.
    auto const host = "127.0.0.1";//"192.168.3.10";
    auto const port = "8002";
    json sendt;
    json tmp;
    json santan;
    json tanshou;
    json umatan;
    json umaren;
    if(argc!=4){
        std::cout << "usage ./a.out row columun race_num" << std::endl;
        return 0;
    }
    sendt["row"] = argv[1];
    sendt["place"] = argv[2];
    sendt["race"] =argv[3];

    tmp["umaban1"] = 1;
    tmp["umaban2"] = 3;
    tmp["umaban3"] = 4;
    tmp["money"] = 100;
    for(int i=0;i<4;i++){
        santan.push_back(tmp);
    }

    sendt["santan"] = santan;

    tmp = {};
    std::cout << tmp.dump() << std::endl;

    tmp["umaban1"] = 4;
    tmp["money"] = 200;
    tanshou.push_back(tmp);
    tmp = {};
    tmp["umaban1"] = 8;
    tmp["money"] = 500;
    tanshou.push_back(tmp);

    sendt["tanshou"] = tanshou;
    tmp = {};

    tmp["umaban1"] = 5;
    tmp["umaban2"] = 8;
    tmp["money"] = 300;
    umatan.push_back(tmp);
    tmp = {};
    tmp["umaban1"] = 2;
    tmp["umaban2"] = 5;
    tmp["money"] = 1000;
    umatan.push_back(tmp);
    sendt["umatan"] = umatan;

    tmp = {};
    tmp["umaban1"] = 4;
    tmp["umaban2"] = 8;
    tmp["money"] = 100;
    umaren.push_back(tmp);

    sendt["umaren"] = umaren;


    std::cout << sendt.dump() << std::endl;

    

    std::string tx = sendt.dump();

    auto const text = tx.c_str();

    // The io_context is required for all I/O
    net::io_context ioc;

    // Launch the asynchronous operation
    std::make_shared<session>(ioc)->run(host, port, text);

    // Run the I/O service. The call will return when
    // the socket is closed.
    ioc.run();

    return EXIT_SUCCESS;
}
