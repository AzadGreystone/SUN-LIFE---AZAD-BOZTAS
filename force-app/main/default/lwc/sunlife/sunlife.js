import { LightningElement, wire, api } from 'lwc';
//apex controller method where all accounts are pulled
import getAccounts from '@salesforce/apex/SunlifeController.getAccounts';
//apex method where accounts are pulled with filter
import getAccountFilter from '@salesforce/apex/SunlifeController.getAccountsByFilter';

import updateMethod from '@salesforce/apex/SunlifeController.updateRecords';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
//where we define columns in datatable
//sortable =If true, it gives the possibility to sort the relevant column.
const COLS = [
    { label: 'Account Name', fieldName: 'AccountLink__c',type:'url', typeAttributes:{label:{fieldName:'Name'}, target:'_blank'},sortable: true},
    { label: 'Owner Name', fieldName: 'Owner_name__c', sortable: true},
    { label: 'Phone', fieldName: 'Phone', type: 'phone',editable:true },
    { label: 'Website', fieldName: 'Website', type: 'url',editable:true},
    { label: 'Annual Revenue', fieldName: 'AnnualRevenue', type: 'currency' , editable : true }
];
export default class Sunlife extends LightningElement {

    @api recordId;
    columns = COLS;
    draftValues = [];
    data=[];
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;

    filterValue='';
    // Function running after LWC installation is finished
      connectedCallback() {
        console.log("Hello1");
        this.getAccounts();
      }

      // Function that works on every key pressed in the search section. 
      //NOTE: When we press 13, that is, our filtering of the enter key begins.
      handleKeyUp(evt) {
          console.log(evt.keyCode);
        const isEnterKey = evt.keyCode === 13;
        if (isEnterKey) {
            this.filterValue = evt.target.value;
            this.getAccountsByFilter();
        }
    }

        //where accuount list is pulled when the first screen is loaded
      getAccounts() {
        console.log("Hello");
       getAccounts().then((result) => {
       console.log(result);
          this.data = result;
       })
         .catch((error) => {
           console.log(error.message);
           this.fireToast("Failed", error.message, "error");
         });
     }
     //Where filtered account list is drawn when filter data is entered
     getAccountsByFilter() {
        console.log("Hello");
        getAccountFilter({filterValue:this.filterValue}).then((result) => {
       console.log(result);
          this.data = result;
       })
         .catch((error) => {
           console.log(error.message);
           this.fireToast("Failed", error.message, "error");
         });
     }
       // The place where sorting is done when clicking on the column name on the datatable
    sortBy(field, reverse, primer) {
        console.log(field);

        // When we sort by account link, it appeared as ID so I changed to name because it does not sort like the data that appears on the screen.
        if(field == 'AccountLink__c'){
            field = 'Name';
        }
        const key = primer
            ? function (x) {
                  return primer(x[field]);
              }
            : function (x) {
                  return x[field];
              };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }
    //Function that works for sorting when clicking on the column name on the datatable
    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.data];
//Sorted function is called here... this.sortedby
        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.data = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }
    // funtion working in inline edit
    async handleSave(event) {
        console.log('handleSave');

        const updatedFields = event.detail.draftValues;
        console.log(updatedFields);
        // Prepare the record IDs for getRecordNotifyChange()
        const notifyChangeIds = updatedFields.map(row => { return { "recordId": row.Id } });
    
        try {
            // Pass edited fields to the updateMethod Apex controller
            const result = await updateMethod({data: JSON.stringify(updatedFields)});
            console.log(JSON.stringify("Apex update result: "+ result));
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Account updated',
                    variant: 'success'
                })
            );
    
            // Refresh LDS cache and wires
            getRecordNotifyChange(notifyChangeIds);
    
             this.getAccountsByFilter();
       } catch(error) {
               this.dispatchEvent(
                   new ShowToastEvent({
                       title: 'Error updating or refreshing records',
                       message: error.body.message,
                       variant: 'error'
                   })
             );
        };
    }
    // *TOAST MESSAGE// //
    fireToast(title, message, variant) {
        const event = new ShowToastEvent({
          title: title,
          message: message,
          variant: variant
        });
        this.dispatchEvent(event);
      }
}