/**
 * Created by akolotii on 25.04.2018.
 */
({
    doInit : function(component, event, helper){
        var inputParams = component.get('v.inputParams');
        component.set('v.oldValue', inputParams.hours);
    },
    getOldValue232321: function(component, event, helper){
        var input = component.find('newValue');
        var newHours = input.get("v.value")
        var inputParams = component.get('v.inputParams');
        var projectId = component.get('v.projectId');
        var dayKey = component.get('v.dayKey');
        var dataForPeriod = component.get('v.dataForPeriod');
        var totalHours = 0;
        for(var i in dataForPeriod[0].employeeProjects){
            totalHours =
                totalHours + dataForPeriod[0].employeeProjects[i].employeeAssignmentTimeWrapper[dayKey].hours *1;
        }
        if(totalHours > dataForPeriod[0].availability || newHours == ''){
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Warning!",
                "message": "Invalid Time Value",
                "type": "Warning"
            });
            input.set('v.value',component.get("v.oldValue"));
            toastEvent.fire();
        }else{
            component.set('v.oldValue', newHours);
            var cmpEvent = component.getEvent("updateEmployeeHours");
            cmpEvent.setParams({
                'projectId' : projectId,
                'hours': newHours,
                'date' : inputParams.trackingDate
            });
            cmpEvent.fire();
        }
    },
})