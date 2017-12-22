package com.portal.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;


@Controller
public class PortalController {

        @RequestMapping("/portal")
        public String hello(){
            return "udw";
        }

}
