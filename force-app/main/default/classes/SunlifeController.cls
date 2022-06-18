public with sharing class SunlifeController {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts() {
        return [
            SELECT Id,name,Owner_name__c,phone,website,annualrevenue,AccountLink__c
            FROM Account
            WHERE Industry ='Financial Services'
    
        ];
    }
    @AuraEnabled(cacheable=false)
    public static List<Account> getAccountsByFilter(String filterValue) {
        String query='SELECT Id,name,Owner_name__c,phone,website,annualrevenue,AccountLink__c '+
                    ' FROM Account '+
                    ' WHERE Industry =\'Financial Services\' ';
        if(filterValue != null ){
            query += ' AND NAME Like \'%'+filterValue+'%\' ';
        }
        List<Account> accList = (List<account>)database.query(query);
        
        return accList;
    }
    @AuraEnabled
    public static string updateRecords(String data){
        List<Account> contactsForUpdate = (List<Account>) JSON.deserialize(
            data,
            List<Account>.class
       );
       try {
           update contactsForUpdate;
           return 'Success: contacts updated successfully';
       }
       catch (Exception e) {
           return 'The following exception has occurred: ' + e.getMessage();
       }
    }
}
