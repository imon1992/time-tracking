/**
 * Created by akolotii on 24.04.2018.
 */
({
    doInit : function(component, event, helper){
        var today = new Date();
        component.set('v.date', today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate());
        helper.setNewDateParams(component,today);
    },
    handleDateChange : function(component, event, helper){
        var selectedDate = new Date(component.get('v.date'));
        var startDate = component.get('v.startWeek');
        var endDate = component.get('v.endWeek');
        if(selectedDate < startDate || selectedDate > endDate){
            helper.toggleSpinner(component);
            helper.setNewDateParams(component,selectedDate);
        }
    },
    prevWeek : function(component, event, helper){
        helper.toggleSpinner(component);
        var prevWeek= new Date(component.get('v.date'));
        prevWeek = new Date(prevWeek.getTime() - 7 * 24 * 60 * 60 * 1000);
        var dateForCalendar = prevWeek.getFullYear() + "-" + (prevWeek.getMonth() + 1) + "-" + prevWeek.getDate()
        component.set('v.date',dateForCalendar);
        helper.setNewDateParams(component,prevWeek);
    },
    nextWeek : function(component, event, helper){
        helper.toggleSpinner(component);
        var nextWeek = new Date(component.get('v.date'));
        nextWeek = new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
        var dateForCalendar = nextWeek.getFullYear() + "-" + (nextWeek.getMonth() + 1) + "-" + nextWeek.getDate()
        component.set('v.date',dateForCalendar);
        helper.setNewDateParams(component,nextWeek);
    },
    updateEmployeeHours : function(component, event, helper){
        var projectId = event.getParam("projectId");
        var newHours = event.getParam("hours");
        var date = event.getParam("date");
        var employeeId =  component.get('v.dataForSelectedPeriod')[0].employeeId;

        helper.updateEmployeeAssignedHours(component, projectId, date, newHours, employeeId);
    }
})