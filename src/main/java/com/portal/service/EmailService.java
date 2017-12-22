package com.portal.service;

import java.util.List;
import org.malagu.linq.JpaUtil;
import org.springframework.stereotype.Service;
import com.portal.entity.Email;

@Service
public class EmailService {
	
	public List<Email> loadEmail(){
		List<Email> emailList =  JpaUtil.linq(Email.class).list();
		return emailList;
			
	}
	
}
