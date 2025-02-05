import * as express from "express";
import * as login from "./login";
import * as time from "./time";
import fetch from "node-fetch";
import * as fs from "fs";

export function start(app: any ): any {
  
  app.get("/camera", login.check, async (request: any, response: any) => {
    console.log("-->", request.query);
    if (request.query) {
      let device = JSON.parse(request.query.device);
      //console.log("llega aqui -1");

      try {
        let data = undefined;
        let base64 = undefined;
        //console.log("llega aqui 0");

        try {
          data = await fetch(`http://${device.direction}/capture`);
          data = await data.blob();
          //console.log(data);
        } catch {
          console.error(`-->  ${device.direction} : Not listened`);
          response.send({ return: false, data: "Device not connected" });
          return;
        }

        try {
          data = Buffer.from(await data.text());
          //console.log("-->arrayData:", data);
          data = data.toString("base64");
          base64 = "data:image/png;base64," + data;
        } catch (error) {
          //console.error(error);
          response.send({ return: false, data: "Device not connected" });
          return;
        }

        response.send({ data: base64, return: true });
        return;
      } catch {
        response.send({ return: false, data: "Device not connected" });
        return;
      }
    }
  });

  app.post("/fpga", login.check, async (request: any, response: any) => {
    request.body.return = false;

    try {
      if (request.body.getReadings == true) {
        request.body.data = await fetch(
          `http://${request.body.device.direction}:${request.body.device.port}/data`,
          {
            method: "post",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              getReadings: true,
            }),
          }
        );
        request.body.data = request.body.data.json();
        request.body.return = true;
      }
      if (request.body.getPublicUrl == true) {
        request.body.data = await fetch(
          `http://${request.body.device.direction}:${request.body.device.port}/data`,
          {
            method: "post",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              getPublicUrl: true,
            }),
          }
        );
        request.body.data = request.body.data.json();
        request.body.return = true;
      }
    } catch (error) {
      console.error(error);
    }
    console.log(request.body);
    response.send(request.body);
  });

  return app;
}
