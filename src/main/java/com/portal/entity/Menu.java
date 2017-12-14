package com.portal.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Transient;
import java.io.Serializable;
import java.util.HashSet;

/**
 * 菜单表
 * @author Handy
 *
 */
@Entity
@JsonSerialize(include= JsonSerialize.Inclusion.NON_NULL)
public class Menu implements Serializable {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	@Id
    @Column(name = "ID",length = 60)
    private String id;
    @Column(name = "NAME",length = 60)
    private String name;
    @Column(name = "PARENT_ID",length = 60)
    @JsonIgnoreProperties
    private String parentId;
    @Column(name = "LABEL",length = 60)
    private String label;
    @Column(name = "ICON",length = 60)
    private String icon;
    @Column(name = "API",length = 60)
    private String api;
    @Column(name = "PATH",length = 60)
    private String path;

    @Transient
    private HashSet<Menu> menus = new HashSet<Menu>(0);

    public HashSet<Menu> getMenus() {
        return menus;
    }

    public void setMenus(HashSet<Menu> menus) {
        this.menus = menus;
    }

    public String getId() {
        return id;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getApi() {
        return api;
    }

    public void setApi(String api) {
        this.api = api;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public void setId(String id) {

        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


}
