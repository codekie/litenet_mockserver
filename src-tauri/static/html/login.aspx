

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    
    
<html xmlns="http://www.w3.org/1999/xhtml" >
<head id="Head1"><link href="App_Themes/steel_gray/default.css" type="text/css" rel="stylesheet" /><title>
	LITENET Incontrol
</title><meta HTTP-EQUIV="Pragma" content="no-cache" /><meta HTTP-EQUIV="Cache-Control" content="no-cache" /><meta HTTP-EQUIV="Pragma-directive" content="no-cache" /><meta HTTP-EQUIV="Cache-Directive" content="no-cache" /><meta HTTP-EQUIV="Content-Style-Type" content="text/css" /><meta HTTP-EQUIV="Expires" content="0" /><link href="App_Themes/steel_gray/default.css" type="text/css" rel="stylesheet" /></head>
<body id="body" onload="window.resizeTo(710,575)">
<form name="frmMain" method="post" action="login.aspx?ReturnUrl=%2fincontrol.web%2fdetail.aspx" id="frmMain">
<div>
<input type="hidden" name="__EVENTTARGET" id="__EVENTTARGET" value="" />
<input type="hidden" name="__EVENTARGUMENT" id="__EVENTARGUMENT" value="" />
<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="/wEPDwUKLTM4NzQ5ODYwMg9kFgICAw8WAh4Gb25sb2FkBRh3aW5kb3cucmVzaXplVG8oNzEwLDU3NSkWAgIBD2QWBgIBDxYCHglpbm5lcmh0bWwFCUFubWVsZHVuZ2QCAw9kFgoCAQ8WAh8BBQlCZW51dHplcjpkAgUPFgIfAQUJUGFzc3dvcnQ6ZAIJDxYCHgV2YWx1ZQUCT0tkAgsPFgIfAgUJQWJicmVjaGVuZAINDxYCHwIFEFBhc3N3b3J0IMOkbmRlcm5kAgUPZBYWAgEPFgIfAQUJQmVudXR6ZXI6ZAIFDxYCHwEFD0FsdGVzIFBhc3N3b3J0OmQCCQ8PFgQeBFRleHQFASEeDEVycm9yTWVzc2FnZQViRGFzIGFsdGUgUGFzc3dvcnQgc3RpbW10IG5pY2h0IMO8YmVyZWluIG9kZXIgZGllIEJlc3TDpHRpZ3VuZyB3dXJkZSBuaWNodCBlcmZvbGdyZWljaCBhdXNnZWbDvGhydCFkZAIKDw8WAh8DBQEhZGQCDA8WAh8BBQ9OZXVlcyBQYXNzd29ydDpkAhAPDxYCHwMFASFkZAISDxYCHwEFGVBhc3N3b3J0IGJlc3QmIzIyODt0aWdlbjpkAhYPDxYEHwMFASEfBAViRGFzIGFsdGUgUGFzc3dvcnQgc3RpbW10IG5pY2h0IMO8YmVyZWluIG9kZXIgZGllIEJlc3TDpHRpZ3VuZyB3dXJkZSBuaWNodCBlcmZvbGdyZWljaCBhdXNnZWbDvGhydCFkZAIXDw8WAh8DBQEhZGQCGQ8WAh8CBQJPS2QCGw8WAh8CBQlBYmJyZWNoZW5kZEdjMlJOG8vpa09BXL8BxU/+mmzQ" />
</div>

<script type="text/javascript">
//<![CDATA[
var theForm = document.forms['frmMain'];
if (!theForm) {
    theForm = document.frmMain;
}
function __doPostBack(eventTarget, eventArgument) {
    if (!theForm.onsubmit || (theForm.onsubmit() != false)) {
        theForm.__EVENTTARGET.value = eventTarget;
        theForm.__EVENTARGUMENT.value = eventArgument;
        theForm.submit();
    }
}
//]]>
</script>


<div>

	<input type="hidden" name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="6DF2486A" />
	<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="/wEWBgL2odeZBgKpwK/OBgK1qbSRCwLgiqiFDgLGm6yJAwLD/8PrBMmStwDnND2vLrtJdVEM/WQI5FzR" />
</div>
    <div id="divMenu" style="vertical-align:middle; padding-left: 0px; padding-top: 1px;">
    <span id="lblLogin" style="padding-left:5px; color:#FFFFFF; font-size:20px; font-weight:bold">Anmeldung</span>
    </div>     
    <div id="divBody">
        <div id="divLogin" class="divInnerBody">
            <table width="500px" border="0px">
                <tr>
                    <td width="141px" style="border:0px;"><span id="lblLoginName">Benutzer:</span></td>
                    <td width="319px" align="left"><input name="txtLoginName" type="text" id="txtLoginName" style="width:300px;" /></td>
                </tr>
                <tr>
                    <td width="141px" style="border:0px;"><span id="lblPassword">Passwort:</span></td>
                    <td width="319px" align="left"><input name="txtPassword" type="password" id="txtPassword" style="width:300px;" /></td>
                </tr>
                <tr>
                    <td colspan="2" align="left">
                        <input onclick="if (typeof(Page_ClientValidate) == 'function') Page_ClientValidate(''); " name="cmdOK" type="submit" id="cmdOK" style="width:150px; font-size: 8pt;" value="OK" />
                        <input onclick="if (typeof(Page_ClientValidate) == 'function') Page_ClientValidate(''); __doPostBack('cmdCancel','')" name="cmdCancel" type="button" id="cmdCancel" style="width:150px; font-size: 8pt;" value="Abbrechen" />
                        <input onclick="if (typeof(Page_ClientValidate) == 'function') Page_ClientValidate(''); __doPostBack('cmdChangePassword','')" name="cmdChangePassword" type="button" id="cmdChangePassword" style="width:150px; font-size: 8pt;" value="Passwort ändern" />
                    </td>
                </tr>
            
            </table><br>
            <table>
                <tr>
                    <td width="600" style="height: 4px">
                        <span id="lblFailedLoginMessage" style="color:Red; font-weight:bold"></span>
                    </td>
                </tr>
            </table>
        </div>
        
    </div>
    <div id="divFooter">
           <table width="100%" border="0" cellpadding="0" cellspacing="0" >
                    <tr>
                    
                       
                        <td width="95%" align="right" valign="baseline"  style="border:0px; padding-top:6px; padding-right:4px;">
                           
                             <a href="http://www.zumtobel.com/" TARGET="_blank"><img border=0 src="Images/Logo_Zumtobel_neg_128px.gif" alt="Zumtobel Lighting" ></a>
                        </td>
                    </tr>
            </table>
        </div>
    </form>
</body>
</html>

