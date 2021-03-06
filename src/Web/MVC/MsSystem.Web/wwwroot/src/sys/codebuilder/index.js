﻿define(function (require, exports, module) {
    require("ztree");
    require("bootstrap");
    require("jquery-extension");
    require('pace');
    require("axios");
    require("vue");

    var layer = require("layer");
    var tableTrees;
    var setting = {
        callback: {
            onClick: zTreeOnClick
        },
        check: {
            enable: true
        },
        data: {
            simpleData: {
                enable: true
            }
        }
    };
    var vm = new Vue({
        el: '#msapp',
        data: {
            'TableSearch': {},
            'TableColumn': []
        },
        mounted: function() {
            this.init();
        },
        methods: {
            init: function () {
                this.TableSearch = {
                    'Database': 'mssystem',
                    'DataSource': '172.16.55.40',
                    'UserId': 'root',
                    'Password': '123456',
                    'TableName': null,
                    'Namespace': 'MsSystem'
                };
            },
            getTables: function () {
                var url = '/Common/CodeBuilder/GetTables';
                axios.get(url, { params: vm.TableSearch }).then(function (response) {
                    var json = response.data;
                    tableTrees = $.fn.zTree.init($("#tableTrees"), setting, json);
                    tableTrees.expandAll(true);
                });
            },
            getTableColumn: function (tablename) {
                this.TableSearch.TableName = tablename;
                var url = '/Common/CodeBuilder/GetTableColumns';
                axios.get(url, { params: vm.TableSearch }).then(function (response) {
                    var res = response.data;
                    vm.TableColumn = res;
                });
            },
            createCode: function(type) {
                var nodes = tableTrees.getCheckedNodes(true);
                var array = [];
                for (var i = 0; i < nodes.length; i++) {
                    if (nodes[i].level == 1) {
                        array.push(nodes[i].name);
                    }
                }
                if (array.length == 0) {
                    return;
                }
                var url = '/Common/CodeBuilder/CreateFile';
                for (var j = 0; j < array.length; j++) {
                    //请求伪造构建
                    var form = document.createElement('form');
                    form.method = "get";
                    form.action = url;
                    document.body.appendChild(form);
                    var hdatabase = document.createElement('input');
                    hdatabase.type = 'hidden';
                    hdatabase.name = 'Database';
                    hdatabase.value = vm.TableSearch.Database;
                    form.appendChild(hdatabase);

                    var hdatasource = document.createElement('input');
                    hdatasource.type = 'hidden';
                    hdatasource.name = 'DataSource';
                    hdatasource.value = vm.TableSearch.DataSource;
                    form.appendChild(hdatasource);

                    var huserid = document.createElement('input');
                    huserid.type = 'hidden';
                    huserid.name = 'UserId';
                    huserid.value = vm.TableSearch.UserId;
                    form.appendChild(huserid);

                    var hpwd = document.createElement('input');
                    hpwd.type = 'hidden';
                    hpwd.name = 'Password';
                    hpwd.value = vm.TableSearch.Password;
                    form.appendChild(hpwd);

                    var htablebname = document.createElement('input');
                    htablebname.type = 'hidden';
                    htablebname.name = 'TableName';
                    htablebname.value = array[j];
                    form.appendChild(htablebname);

                    var hns = document.createElement('input');
                    hns.type = 'hidden';
                    hns.name = 'Namespace';
                    hns.value = vm.TableSearch.Namespace;
                    form.appendChild(hns);

                    var htype = document.createElement("input");
                    htype.type = "hidden";
                    htype.name = "Type";
                    htype.value = type;
                    form.appendChild(htype);
                    form.submit();
                }
            }
        }
    });
    function zTreeOnClick(event, treeId, treeNode) {
        vm.getTableColumn(treeNode.name);
    };
});