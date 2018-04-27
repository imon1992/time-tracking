/**
 * Created by akolotii on 24.04.2018.
 */
({
    setNewDateParams : function(component,date){
        var day = date.getDay();
        var diff = date.getDate() - day + (day == 0 ? -6 : 1);
        var weekStartDay = new Date(date.setDate(diff));
        var weekEndDay = new Date(weekStartDay.getTime() + 6 * 24 * 60 * 60 * 1000);

        var formatter = new Intl.DateTimeFormat("en", { month: "short" });
        var startDateMonth = formatter.format(new Date(weekStartDay));
        var endDateMonth = formatter.format(new Date(weekEndDay));
        var weekStartDayForShow = weekStartDay.getDate();
        var weekEndDayForShow = weekEndDay.getDate();

        if(weekStartDayForShow.toString().length == 1){
            weekStartDayForShow = '0' + weekStartDayForShow;
        }
        if(weekEndDayForShow.toString().length == 1){
            weekEndDayForShow = '0' + weekEndDayForShow;
        }

        var forShow = '(' + weekStartDayForShow + ' ' + startDateMonth  + ' - ' + weekEndDayForShow + ' ' + endDateMonth + ')' ;
        this.generateTableHeaderArray(component,weekStartDay,'ds');
        component.set('v.dateForShow', forShow);
        component.set('v.startWeek', weekStartDay);
        component.set('v.endWeek', weekEndDay);
        var startDate = weekStartDay.getFullYear() + "-" + (weekStartDay.getMonth() + 1) + "-" + weekStartDay.getDate()
        var endDate = weekEndDay.getFullYear() + "-" + (weekEndDay.getMonth() + 1) + "-" + weekEndDay.getDate()
        this.getDataForDatesPeriod(component,startDate,endDate);
    },
    generateTableHeaderArray : function(component,startDate,endDate){
        var tableHeaderObjectsArray = [];
        for(var i = 0; i < 7;i++){
            var tableHeaderObject = {};
            var formatter = new Intl.DateTimeFormat("en", { weekday: "short" });
            var weekday = formatter.format(new Date(startDate));
            var day = startDate.getDate()
            var month = startDate.getMonth();
            if(day.toString().length == 1){
                day = '0' + day;
            }
            if(month.toString().length == 1){
                month = '0' + month;
            }
            tableHeaderObject.weekDay = weekday;
            tableHeaderObject.dayAndMonth = day + '/' + month;
            tableHeaderObjectsArray.push(tableHeaderObject);
            startDate = new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000);
        }
        component.set('v.tableHeaderObject',tableHeaderObjectsArray);
    },
    getDataForDatesPeriod : function(component,startDate,endDate){
        var self = this;
        var action = component.get('c.getEmployeeData');
        action.setParams({
            'startPeriod':startDate,
            'endPeriod':endDate,
        });
        action.setCallback(this,function(response){
            if (response.getState() === 'SUCCESS') {
                var retObj = JSON.parse(response.getReturnValue());
                console.log(retObj);
                component.set('v.dataForSelectedPeriod',retObj);
                component.set('v.employeeProjects',retObj.employeeProjects);
                this.toggleSpinner(component);
            }else if (response.getState() === 'ERROR'){
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        alert(errors[0].message);
                    }
                }
            }
        });
        $A.enqueueAction(action);
    },
    updateEmployeeAssignedHours : function(component, projectId, date, newHours, employeeId){
        var action = component.get('c.updateEmployeeAssignmentTime');
        action.setParams({
            'projectId' : projectId,
            'dayForUpdate' : date,
            'hours' : newHours,
            'employeeId' : employeeId
        });
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR'){
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        alert(errors[0].message);
                    }
                }
            }
        });
        $A.enqueueAction(action);
    },
    toggleSpinner: function(component){
        var spinner = component.find('spinner');
        $A.util.toggleClass(spinner, "slds-hide");
    }
})