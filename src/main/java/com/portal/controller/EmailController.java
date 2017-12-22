package com.portal.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.portal.entity.Email;
import com.portal.service.EmailService;

@Controller
public class EmailController {
	
	@Autowired
	EmailService emailService;
	
	
	@RequestMapping("/emails")
//	@ResponseBody
	public List<Email> getEmail(){
		List<Email> email = emailService.loadEmail();
		return email;
		
	}

}
