#include <time.h>
#include <fastcgi2/component.h>
#include <fastcgi2/component_factory.h>
#include <fastcgi2/handler.h>
#include <fastcgi2/request.h>
#include <fastcgi2/logger.h>
#include <fstream>
#include <boost/format.hpp>
#include "mongo/client/dbclient.h"

const std::string MONGO_URI = "localhost";

class ZenClass : virtual public fastcgi::Component, virtual public fastcgi::Handler {

public:
    ZenClass(fastcgi::ComponentContext *context) :
            fastcgi::Component(context) {
    }

    virtual ~ZenClass() {
    }

public:
    virtual void onLoad() {
        fastcgi::ComponentContext *cntx = context();
        LOG = cntx->findComponent<fastcgi::Logger>("daemon-logger");
        LOG->info("begin initialization");
        mongo::Status status = mongo::client::initialize();
        if (!status.isOK()) {
            LOG->error("failed to initialize the client driver: %s", status.codeString().data());
            throw "Error";
        }

        std::ifstream headerIn("/home/maksim/ClionProjects/fcgi-app/header.template");
        headerTemplate = std::string((std::istreambuf_iterator<char>(headerIn)), std::istreambuf_iterator<char>());
        std::ifstream footerIn("/home/maksim/ClionProjects/fcgi-app/footer.template");
        footerTemplate = std::string((std::istreambuf_iterator<char>(footerIn)), std::istreambuf_iterator<char>());

        LOG->info("up and running");
    }

    virtual void onUnload() {
    }

    virtual void handleRequest(fastcgi::Request *request, fastcgi::HandlerContext *context) {
        std::string const &requestMethod = request->getRequestMethod();
        if (requestMethod == "GET") {
            handleGet(request, context);
        } else if (requestMethod == "POST") {
            handlePost(request, context);
        }
    }

private:
    fastcgi::Logger *LOG;
    std::string headerTemplate;
    std::string footerTemplate;

    void handlePost(fastcgi::Request *request, fastcgi::HandlerContext *context) {
        std::string const &scriptName = request->getScriptName();
        if ("/zen/api/usd" != scriptName) {
            request->sendError(405);
            return;
        }
        std::string data;
        request->requestBody().toString(data);
        LOG->info("Received new data: %s", data.data());
        mongo::BSONObj dataBson = mongo::fromjson(data);
        mongo::BSONElement rate = dataBson.getField("rate");
        if (rate.eoo()) {
            std::string result = BSON("result" << "Error. 'rate' should be provided").jsonString(mongo::JsonStringFormat::Strict, 0);
            request->setStatus(400);
            request->write(result.data(), result.size());
            return;
        }

        time_t t = time(0);
        struct tm *tm = localtime(&t);
        char date[20];
        strftime(date, sizeof(date), "%d.%m.%Y", tm);
        mongo::BSONObjBuilder b;
        b.appendNumber("rate", rate.numberDouble());
        b.appendTimeT("timestamp", t);
        b.append("date", date);
        mongo::BSONObj newRateObj = b.obj();

        mongo::ScopedDbConnection connection(MONGO_URI);
        if (!connection.ok()) {
            request->sendError(500);
            return;
        }
        connection->insert("zendb.usd", newRateObj);
        connection.done();

        std::string result = BSON("result" << "ok").jsonString(mongo::JsonStringFormat::Strict, 0);
        request->write(result.data(), result.size());
    }

    void handleGet(fastcgi::Request *request, fastcgi::HandlerContext *context) {
        mongo::ScopedDbConnection connection(MONGO_URI);

        if (!connection.ok()) {
            request->sendError(500);
            return;
        }

        mongo::BSONObj rateObj = connection->findOne("zendb.usd", mongo::Query("{}").sort("timestamp", -1));
        connection.done();

        if (rateObj.isEmpty()) {
            LOG->error("query failure");
            request->sendError(500);
            return;
        }

        std::string const &scriptName = request->getScriptName();
        if ("/zen/api/usd" == scriptName) {
            std::string result = BSON(
                    "rate" << rateObj.getField("rate").numberDouble() << "date" << rateObj.getStringField("date")
            ).jsonString(mongo::JsonStringFormat::Strict, 0);
            request->write(result.data(), result.size());
        } else {
            servePage(rateObj, request, context);
        }
    }

    void servePage(mongo::BSONObj rateObj, fastcgi::Request *request, fastcgi::HandlerContext *context) {
        double rate = rateObj.getField("rate").numberDouble();
        double realRate = rate * 1.3;
        std::string date = rateObj.getStringField("date");

        request->write(headerTemplate.data(), headerTemplate.size());

        std::stringstream buf;
        buf << boost::format(
                "<h1 class=\"value \">%1%</h1>\n"
                        "<p class=\"text\" langname=\"text\"></p>\n"
                        "<p class=\"text\" langname=\"text3\"></p>\n"
                        "<h1 class=\"value\">%2%</h1>\n"
                        "<p class=\"text\" langname=\"text2\"></p>\n"
                        "<div class=\"update\">\n"
                        "     <span langname=\"update\"></span>\n"
                        "     <p>%3%</p>\n"
                        "</div>\n"
        ) % (int) rate % (int) realRate % date;

        std::string s = buf.str();
        request->write(s.data(), s.size());
        request->write(footerTemplate.data(), footerTemplate.size());
    }
};

FCGIDAEMON_REGISTER_FACTORIES_BEGIN()
    FCGIDAEMON_ADD_DEFAULT_FACTORY("zen_factory", ZenClass)
FCGIDAEMON_REGISTER_FACTORIES_END()
