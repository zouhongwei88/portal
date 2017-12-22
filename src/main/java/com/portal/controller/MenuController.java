package com.portal.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.portal.entity.Menu;
import com.portal.service.MenuService;

@Controller
public class MenuController {
	
	
	@Autowired
	MenuService menuService;
	
	@RequestMapping("/menus")
    @ResponseBody
    public List<Menu> getMenus(){
            List<Menu> menus =   menuService.getMenus();
            return menus;
    }

}
