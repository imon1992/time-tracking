/**
 * Created by akolotii on 27.04.2018.
 */

public with sharing class L_userAssignmentTimeController {
    @AuraEnabled
    public static String getEmployeeData(String startPeriod, String endPeriod) {
        Date startPeriodDate = Date.valueOf(startPeriod);
        Date endPeriodDate = Date.valueOf(endPeriod);

        Map<Id, EmployeeProjectWrapper> employeeProjectWrapperMap = new Map<Id, EmployeeProjectWrapper>();
        EmployeeDataWrapper employeeDataWrapper = new EmployeeDataWrapper();
        Employee__c[] employeeDataList = [
                SELECT Id, Availability__c, First_Name__c, Last_Name__c,
                        (SELECT Project__c, Project__r.Name FROM EmployeeSkills__r)
                FROM Employee__c
                WHERE User__c = :UserInfo.getUserId()
        ];

        for (Employee__c employeeData : employeeDataList) {
            EmployeeSkill__c[] employeeSkills = (EmployeeSkill__c[]) employeeData.EmployeeSkills__r;
            employeeDataWrapper.firstName = employeeData.First_Name__c;
            employeeDataWrapper.lastName = employeeData.Last_Name__c;
            employeeDataWrapper.employeeId = employeeData.Id;
            employeeDataWrapper.availability = employeeData.Availability__c;
            for (EmployeeSkill__c employeeSkill : employeeSkills) {
                EmployeeProjectWrapper employeeProjectWrapper = new EmployeeProjectWrapper();
                employeeProjectWrapper.projectId = employeeSkill.Project__c;
                employeeProjectWrapper.projectName = employeeSkill.Project__r.Name;
                employeeProjectWrapperMap.put(employeeSkill.Project__c, employeeProjectWrapper);
            }
        }

        Set<Id> employeeIdsSet = employeeProjectWrapperMap.keySet();
        AggregateResult[] sumHoursOnProjectPerDateList = [
                SELECT SUM(Hours__c) hoursPerDay, Project__c, Assignment_Day__r.Date__c
                FROM EmployeeAssigmentTime__c
                WHERE Assignment_Day__r.Date__c <= :endPeriodDate
                AND Assignment_Day__r.Date__c >= :startPeriodDate AND project__c IN :employeeIdsSet
                GROUP BY Project__c, Assignment_Day__r.Date__c
        ];

        for (AggregateResult sumHoursOnProjectPerDate : sumHoursOnProjectPerDateList) {
            EmployeeAssignmentTimeWrapper EmployeeAssignmentTime = new EmployeeAssignmentTimeWrapper();

            EmployeeAssignmentTime.hours = (Decimal) sumHoursOnProjectPerDate.get('hoursPerDay');
            EmployeeAssignmentTime.trackingDate = (Date) sumHoursOnProjectPerDate.get('Date__c');
            List<EmployeeAssignmentTimeWrapper> aa = new List<EmployeeAssignmentTimeWrapper>();
            if (employeeProjectWrapperMap.get((id) sumHoursOnProjectPerDate.get('Project__c')).employeeAssignmentTimeWrapper != null) {
                employeeProjectWrapperMap.get((id) sumHoursOnProjectPerDate.get('Project__c')).employeeAssignmentTimeWrapper.add(EmployeeAssignmentTime);
            } else {
                aa.add(EmployeeAssignmentTime);
                employeeProjectWrapperMap.get((id) sumHoursOnProjectPerDate.get('Project__c')).employeeAssignmentTimeWrapper = aa;
            }
        }
        List<EmployeeProjectWrapper> employeeProjectWrapperList = new List<EmployeeProjectWrapper>();
        for (Id projectId : employeeIdsSet) {
            List<EmployeeAssignmentTimeWrapper> trackingTime = new List<EmployeeAssignmentTimeWrapper>();
            Date employeeAssignmentDate = startPeriodDate;
            for (Integer i = 0; i < 7; i++) {
                EmployeeAssignmentTimeWrapper employeeAssignmentTimeWrapper = new EmployeeAssignmentTimeWrapper();

                employeeAssignmentTimeWrapper.hours = 0;
                employeeAssignmentTimeWrapper.trackingDate = employeeAssignmentDate;
                trackingTime.add(employeeAssignmentTimeWrapper);
                employeeAssignmentDate = employeeAssignmentDate.addDays(1);
            }
            for (EmployeeAssignmentTimeWrapper weekEmployeeAssignmentTime : trackingTime) {
                if (employeeProjectWrapperMap.get(projectId).employeeAssignmentTimeWrapper != null) {
                    for (EmployeeAssignmentTimeWrapper existingEmployeeAssignmentTime : employeeProjectWrapperMap.get(projectId).employeeAssignmentTimeWrapper) {
                        if (weekEmployeeAssignmentTime.trackingDate == existingEmployeeAssignmentTime.trackingDate) {
                            weekEmployeeAssignmentTime.hours = existingEmployeeAssignmentTime.hours;
                        }
                    }
                }
            }
            employeeProjectWrapperMap.get(projectId).employeeAssignmentTimeWrapper = trackingTime;
            employeeProjectWrapperList.add(employeeProjectWrapperMap.get(projectId));
        }
        employeeDataWrapper.employeeProjects = employeeProjectWrapperList;
        return JSON.serialize(employeeDataWrapper);
    }

    @AuraEnabled
    public static void updateEmployeeAssignmentTime(Id projectId, String dayForUpdate, Decimal hours, Id employeeId) {
        Date dateForUpdate = Date.valueOf(dayForUpdate);
        EmployeeAssigmentTime__c[] assignmentTimeList = [
                SELECT Hours__c
                FROM EmployeeAssigmentTime__c
                WHERE Assignment_Day__r.Date__c = :dateForUpdate
                AND Project__c = :projectId
        ];
        EmployeeAssigmentTime__c assignmentTime = new EmployeeAssigmentTime__c();
        if (!assignmentTimeList.isEmpty()) {
            assignmentTime = assignmentTimeList[0];
            assignmentTime.Hours__c = hours;
        } else {
            Assignment_Day__c[] assignmentDayList = [
                    SELECT Id
                    FROM Assignment_Day__c
                    WHERE Date__c = :dateForUpdate
            ];
            Assignment_Day__c assignmentDay;
            if (assignmentDayList.isEmpty()) {
                assignmentDay = new Assignment_Day__c(Date__c = dateForUpdate);
                insert assignmentDay;
            }else{
                assignmentDay = assignmentDayList[0];
            }
            assignmentTime = new EmployeeAssigmentTime__c(Assignment_Day__c = assignmentDay.Id,
                    Project__c = projectId, Hours__c = hours, Employee__c = employeeId);
        }

        upsert assignmentTime;
    }
    public with sharing class EmployeeDataWrapper {
        public String firstName { get; set; }
        public String lastName { get; set; }
        public EmployeeProjectWrapper[] employeeProjects { get; set; }
        public Id employeeId { get; set; }
        public Decimal availability { get; set; }


    }
    public with sharing class EmployeeProjectWrapper {
        public Id projectId { get; set; }
        public String projectName { get; set; }
        public EmployeeAssignmentTimeWrapper[] employeeAssignmentTimeWrapper { get; set; }
    }

    public with sharing class EmployeeAssignmentTimeWrapper {
        public Decimal hours { get; set; }
        public Date trackingDate { get; set; }
    }
}