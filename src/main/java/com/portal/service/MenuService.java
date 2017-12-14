package com.portal.service;

import java.util.List;

import org.malagu.linq.JpaUtil;
import org.springframework.stereotype.Service;

import com.portal.entity.Menu;


@Service
public class MenuService {

	public List<Menu> getMenus(){
	       List<Menu> menuList = JpaUtil.linq(Menu.class).isNull("parentId").list();
	        for(Menu menu :menuList){
	            List<Menu> list = JpaUtil.linq(Menu.class).equal("parentId",menu.getId()).list();
	            for(Menu m : list){
	                menu.getMenus().add(m);
	            }
	            if(menu.getMenus().size()==0){
	            	menu.setMenus(null);
	            }
	        }

	        return menuList;
	    }
}
