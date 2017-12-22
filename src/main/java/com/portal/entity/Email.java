package com.portal.entity;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;

/**
 * 邮件列表
 * @author Handy
 *
 */
@Entity
@JsonSerialize(include= JsonSerialize.Inclusion.NON_NULL)
public class Email implements Serializable {

	/**
	 * 
	 */	
	private static final long serialVersionUID = 2218685107300716032L;
	
	@Id
    @Column(name = "ID",length = 60)
    private String id;
    
	@Column(name = "BUSINESSTASKID",length = 60)
    private String businessTaskId;
    
	@Column(name = "BRANCHNAME",length = 60)
    private String branchName;
    
	@Column(name = "SENDTIME")
	@Temporal(TemporalType.DATE)
    private Date sendTime;
    
	@Column(name = "RECEIVETIME")
	@Temporal(TemporalType.DATE)
    private Date receiveTime;
    
	@Column(name = "EMERGENCE",length = 60)
    private String emergence;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getBusinessTaskId() {
		return businessTaskId;
	}

	public void setBusinessTaskId(String businessTaskId) {
		this.businessTaskId = businessTaskId;
	}

	public String getBranchName() {
		return branchName;
	}

	public void setBranchName(String branchName) {
		this.branchName = branchName;
	}

	public Date getSendTime() {
		return sendTime;
	}

	public void setSendTime(Date sendTime) {
		this.sendTime = sendTime;
	}

	public Date getReceiveTime() {
		return receiveTime;
	}

	public void setReceiveTime(Date receiveTime) {
		this.receiveTime = receiveTime;
	}

	public String getEmergence() {
		return emergence;
	}

	public void setEmergence(String emergence) {
		this.emergence = emergence;
	}
    
	
}
