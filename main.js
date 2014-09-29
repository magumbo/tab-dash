/* bMobilized Angular Dashboard - (c) 2014 Laurence Tunnicliffe */
var partnerDash = angular.module('partnerDashModule', ['ngRoute','ngGrid','ngAnimate','pascalprecht.translate','LocalStorageModule']);
partnerDash.config(['$translateProvider', function ($translateProvider, $translatePartialLoaderProvider) {
	/*
	$translateProvider.useLoader('$translateUrlLoader', {
	  url: 'https://dbnubj8nh4uqt.cloudfront.net/api/index.php?domain=' + window.location.hostname + '&sfPage=MasterPartnerDashboard&callback=JSON_CALLBACK',
	  method: 'JSONP',
	  key: 'en-US'
	});
	*/
	$translateProvider.useUrlLoader('https://dev.bmobilized.com/tmp/tabular/en.json');
	
	//$translateProvider.preferredLanguage(window.language);
	$translateProvider.preferredLanguage('en');
	$translateProvider.usePostCompiling(true);
	
}]);
partnerDash.factory('VFRemotingFactory',function($q,$rootScope){  
			       var factory = {};  
			       
				   $.remote = function (method, params, callback, controller) {
						if($.isFunction(callback)){
							callback = {success: callback, error: callback};
						}
						
						if(controller == undefined) controller = window.remoteController;
					
						var rParams;
						
						if ($.isArray(params)) {
							rParams = [controller + '.' + method].concat(params)
						} else {
							rParams = [controller + '.' + method, params];
						}
						rParams.push(function (result, event) {
							if (event.status) {
								callback.success(result, event);
							} else if (event.type === 'exception') {
								if(callback.error){
									callback.error(event);
								} else {
									if(event.statusCode == 500){
										callback.error(event);
										console.log('Logged Out');
									} else if(event.statusCode == 402){
										callback.error(event);
										console.log('Invalid Session');
									} else if(event.statusCode == 400){
										callback.error(event);
										console.log('400');
									}
								}
							} else {
								if(callback.error){
									callback.error(event);
								} else 
									console.log('Exception3: ' + event.message);
							}
						});
						rParams.push({
							escape: true
						})
						Visualforce.remoting.Manager.invokeAction.apply(Visualforce.remoting.Manager, rParams);
					}
				   
					factory.sfRemote = function(command, params){  
						var deferred = $q.defer();  
						$.remote(command, params, function(result){  
							$rootScope.$apply(function(){  
								deferred.resolve(result);  
							});  
						});  
						return deferred.promise;  
					}  
					return factory;  
});  
partnerDash.controller('partnerDashController', function($scope, $http, localStorageService, $attrs, $translate, VFRemotingFactory) {

	/*
	$routeProvider.when('/', {
            templateUrl: 'templates/homeView.html',
            controller: 'HomeController'
        });
	*/	

	

	
    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: true
    };

	

		

	
	
	if(!localStorageService.get('bMpDsettings')){
		$scope.userSettings = {
			shownCols: {
						logo: true,
						name: true,
						basedUpon: true,
						slug: true,
						message: true,
						owner: true
						},
			fullWidth: false,
			defaultSites: 10,
			accessible: false
		}
	} else {
		$scope.userSettings = localStorageService.get('bMpDsettings');
	}
		
	$scope.totalServerItems = 0;
    $scope.pagingOptions = {
        pageSizes: [10, 20, 50],
        pageSize: $scope.userSettings.defaultSites,
        currentPage: 1
    };  
	
	
	$scope.largeCheck = false;
	
    $scope.setPagingData = function(data, page, pageSize, largeAccount){	
		if(largeAccount){
			var pagedData = data; //Show the 50 we were sent
		} else {
			var pagedData = data.slice((page - 1) * pageSize, page * pageSize); //Cut a portion of the total and show that
			$scope.totalServerItems = data.length; //True length
		}
		$scope.myData = pagedData;
		if (!$scope.$$phase) {
            $scope.$apply();
        }
    };
	
    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
		setTimeout(function () {
            var data;
            if (searchText) {
                var ft = searchText.toLowerCase();
				VFRemotingFactory.sfRemote('getSites', ['',searchText, 0]).then(function(largeLoad){
						
					angular.forEach(largeLoad, function(value){
						$translate('yourTrialHasExpired').then(function(data){
							//console.log(data);
							value.ur_status__c = value.ur_status__c.replace('{{yourTrialHasExpired}}', data);
						});
						$translate('purchased').then(function(data){
							//console.log(data);
							value.ur_status__c = value.ur_status__c.replace('{{purchased}}', data);
						});
						$translate('inTrialWith').then(function(data){
							//console.log(data);
							value.ur_status__c = value.ur_status__c.replace('{{inTrialWith}}', data);
						});
						$translate('daysRemaining').then(function(data){
							//console.log(data);
							value.ur_status__c = value.ur_status__c.replace('{{daysRemaining}}', data);
						});
						$translate('dayRemaining').then(function(data){
							//console.log(data);
							value.ur_status__c = value.ur_status__c.replace('{{dayRemaining}}', data);
						});
						$translate('alertLessThan24hRemaining').then(function(data){
							//console.log(data);
							value.ur_status__c = value.ur_status__c.replace('{{alertLessThan24hRemaining}}', data);
						});		
					});
						
						
						
						
						data = largeLoad.filter(function(item) {
							return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
						});
						$scope.setPagingData(data,page,pageSize);
					},
					function(error)  {
						console.log('ERROR: ' + error.message);
					}
				); 
            } else {
			
				$scope.fetchSites = function(startPoint){
					VFRemotingFactory.sfRemote('getSites', ['','',startPoint]).then(function (largeLoad) {
						/* This is to avoid conflict with messages from other dashboards - to be fixed when we deprecate them */
						angular.forEach(largeLoad, function(value){
							$translate('yourTrialHasExpired').then(function(data){
								//console.log(data);
								value.ur_status__c = value.ur_status__c.replace('{{yourTrialHasExpired}}', data);
							});
							$translate('purchased').then(function(data){
								//console.log(data);
								value.ur_status__c = value.ur_status__c.replace('{{purchased}}', data);
							});
							$translate('inTrialWith').then(function(data){
								//console.log(data);
								value.ur_status__c = value.ur_status__c.replace('{{inTrialWith}}', data);
							});
							$translate('daysRemaining').then(function(data){
								//console.log(data);
								value.ur_status__c = value.ur_status__c.replace('{{daysRemaining}}', data);
							});
							$translate('dayRemaining').then(function(data){
								//console.log(data);
								value.ur_status__c = value.ur_status__c.replace('{{dayRemaining}}', data);
							});
							$translate('alertLessThan24hRemaining').then(function(data){
								//console.log(data);
								value.ur_status__c = value.ur_status__c.replace('{{alertLessThan24hRemaining}}', data);
							});		
						});
						/* End hack */
						$scope.setPagingData(largeLoad,page,pageSize, $scope.largeAccount);
						//console.log(largeLoad,page,pageSize, $scope.largeAccount);
						},
					   function(error)  {console.log('ERROR: ' + error.message);}
					);
						
				}
								
								
				
				var startPoint = ((page-1) * pageSize);
				
				if(!$scope.largeCheck){ //Get total from SF only once
					VFRemotingFactory.sfRemote('getTotalSites', ['','']).then(function(data){
								if(data > 50){
									$scope.userSettings.defaultSites = 50;
									$scope.pagingOptions.pageSize = 50;
									$scope.largeAccount = true;
									$scope.totalServerItems = data;
								}
								$scope.largeCheck = true;
								$scope.fetchSites(startPoint); //Fetch 
							},
							function(error)  {
								console.log('ERROR: ' + error.message);
							}
						); 
				} else {
					if($scope.largeAccount){ //We know this now
						$scope.fetchSites(startPoint);
					} else {
						$scope.fetchSites(0); //Fetch from point zero
					}
				}
					
			}
        }, 100);
    }; 
	
    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
	
    $scope.$watch('pagingOptions', function (newVal, oldVal) {
       //if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) { // why was this conditional here?
			$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
			$scope.clearSelections();
		//}
		//$scope.$apply
		$scope.userSettings.defaultSites = newVal.pageSize;
	}, true);
	
    $scope.$watch('filterOptions', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);
	
	$scope.multiSelect = false;
	
    $(".app").keydown(function (e){
      if((e.keyCode == 16 || e.keyCode == 17) && !$scope.multiSelect){
        $scope.multiSelect = true;
      }
    });
	
    $(".app").keyup(function (e){
      if((e.keyCode == 16 || e.keyCode == 17)){
        $scope.multiSelect = false;
      }
    });

	$scope.selectedRows = [];
	
	$scope.refreshTran = function(){
		$translate.refresh();
	}

	$scope.gridColumnDefs = [
		{
		field: 'Original_Site__c',
		cellTemplate: '<div class="logoCell" data-id="{{row.entity.Id}}"><img title="{{row.entity[col.field]}}" src="https://www.google.com/s2/favicons?domain={{row.entity[col.field]}}" /></div>',
		displayName: '', 
		enableCellEdit: false,
		width: '**',
		visible: $scope.userSettings.shownCols.logo
		},
		{
		field: 'Mobile_Site_Name__c',
		displayName: 'Name', 
		enableCellEdit: true,
		width: '******',
		visible: $scope.userSettings.shownCols.name
		},
		{
		field:'Original_Site__c', 
		//cellTemplate: '<div class="ngCellText"><div class="hoverPop"><a href="http://{{row.entity[col.field]}}" target="_blank" title="{{row.entity[col.field]}}">Visit Original Site</a></div><span>{{row.entity[col.field]}}</span></div>',
		displayName:'Based upon', 
		enableCellEdit: false,
		width: '******',
		visible: $scope.userSettings.shownCols.basedUpon
		}, 
		{
		field: 'Default_Mobile_Domain__c',
		displayName: 'Slug',
		enableCellEdit: false,
		width: '******',
		visible: $scope.userSettings.shownCols.slug
		}, 
		{
		field: 'ur_status__c',
		cellTemplate: '<div class="ngCellText" translate>{{row.entity[col.field]}}</div>',
		displayName: 'Message',
		enableCellEdit: false,
		width: '*********',
		visible: $scope.userSettings.shownCols.message
		}, 
		{
		field: 'Owner.Name', 
		cellTemplate: '<div class="ngCellText"><a href="UserEdit?userId={{row.entity.Owner.Id}}" title="{{row.entity.Owner.Name}}">{{row.entity.Owner.Name}}</a></div>',
		displayName: 'Owned By',
		enableCellEdit: false,
		width: '******',
		visible: $scope.userSettings.shownCols.owner
		}
	]
	
	
	$translate($scope.gridColumnDefs[1].displayName).then(function(data){
		console.log(data);
		//value.ur_status__c = value.ur_status__c.replace('{{yourTrialHasExpired}}', data);
	});
	

	angular.forEach($scope.gridColumnDefs, function(value){
		$translate(value.displayName).then(function(data){value.displayName = data;});
	});
	
	$scope.toggleCol = function(i) {
		$scope.gridOptions.$gridScope.columns[i].toggleVisible()
	}
	
	$scope.reDraw = function(){
		setTimeout(function(){
			$scope.gridOptions.$gridServices.DomUtilityService.RebuildGrid($scope.gridOptions.$gridScope, $scope.gridOptions.ngGrid);
		}, 30); //Redraw the grid on visual update, bit of a hack
	}
	
	$scope.clearSelections = function(){
		angular.forEach($scope.myData, function(data, index){
		  $scope.gridOptions.selectRow(index, false);
		});
	}
	

	
    $scope.gridOptions = { 
		data: 'myData',
		enablePaging: true,
		showFooter: true,
		filterOptions: $scope.filterOptions,
		totalServerItems:'totalServerItems',
		pagingOptions: $scope.pagingOptions,
		filterOptions: $scope.filterOptions,
		enableCellSelection: false,
		enableCellEdit: true,
		enableRowSelection: true,
		/*enableColumnReordering: true, in the future */
		showGroupPanel: true,
		selectedItems: $scope.selectedRows,
		plugins: [new ngGridFlexibleHeightPlugin()],
		beforeSelectionChange: function(rowItem, event){
			if(!$scope.multiSelect)
			{
			 $scope.clearSelections();
			}
			return true;
		},
		rowHeight: 50,
		rowTemplate: '<div style="height: 100%" ng-class="{expired: row.getProperty(\'Trial_Expired__c\')}">' + 
                    '<div ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell ">' +
                      '<div ng-cell></div>' +
                    '</div>' +
                 '</div>',
		columnDefs: 'gridColumnDefs'
	};
	
	$scope.locals = window.locals;
	
	$scope.pptConfig = window.pptOptions;
	
	/* ajax service to retrieve these is probably better than laying them out in VisualForce, but here we are *
	$scope.pptConfig = {
		pplogo: encodeURIComponent('http://bmobilized.com/images/logo.png'),
		ppheaderbg: encodeURIComponent('fff'),
		ppbodybg: encodeURIComponent('fff'),
		ppwidth: encodeURIComponent('900'),
		ppheight: encodeURIComponent('1300'),
		ppbuttontext: encodeURIComponent('Mobilize'),
		ppheadertext: encodeURIComponent('Compare+The+Difference'),
		ppleftwindowtext: encodeURIComponent('Before+Your+Brand'),
		pprightwindowtext: encodeURIComponent('After+Your+Brand'),
		ppprinttext: encodeURIComponent('Print+This+Preview.'),
		ppcontactemailtext: encodeURIComponent('Email+This+Preview'),
		ppcontactemailtext: encodeURIComponent('Email+This+Preview'),
		ppcontactemaillinksubject: encodeURIComponent('View+Your+New+Mobile+Website%21'),
		ppcontactemaillinkbody: encodeURIComponent('Go+to+%24previewUrl+for+a+great+conversion+of+%24originalSite'),
		ppcontactemail: encodeURIComponent('youremail%40yourcompany.com'),
		ppcontactphone: encodeURIComponent('555-555-5555'),
		ppverb: encodeURIComponent(''),
		ppshow: encodeURIComponent('false'),
		ppdisclaimer: encodeURIComponent('yourcompany.com'),
		ppframe1: encodeURIComponent('cnn.com'),
		ppframe2: encodeURIComponent('http://cnn978.cloudhostedresources.com')
	}
	*/
	
	$scope.rootPerms = {
		Allow_Show_Tools__c: true, 
		Allow_Delete__c: true,
		Allow_Statistics__c: true,
		Allow_Publish__c: true,
		Allow_redirection_change__c: true,
		Allow_Analytics__c: true,
		Allow_Ownership_change__c: true,
		Allow_custom_domain_change__c: true,
		Allow_Unsubscribe__c: true,
		Allow_buy_on_behalf__c: true,
		Allow_Buy__c: true 
	};
	
	$scope.sitePerms = {
		Allow_Show_Tools__c: true, 
		Allow_Delete__c: true,
		Allow_Statistics__c: true,
		Allow_Publish__c: true,
		Allow_redirection_change__c: true,
		Allow_Analytics__c: true,
		Allow_Ownership_change__c: true,
		Allow_custom_domain_change__c: true,
		Allow_Unsubscribe__c: true,
		Allow_buy_on_behalf__c: true,
		Allow_Buy__c: true
	};
	
	$scope.activeSite = false;
	
	$scope.hideMulti = function(){
		/*$scope.sitePerms['Allow_Show_Tools__c'] = $scope.sitePerms['Allow_Statistics__c '] = $scope.sitePerms['Allow_Analytics__c'] = $scope.sitePerms['Allow_custom_domain_change__c'] = $scope.sitePerms['Allow_redirection_change__c'] = false;
		$scope.multiSelect = true;*/
	}
	
	$scope.checkSite = function(value, multi){
		if(!multi){
			$scope.activeSite = value;
			console.log('Selected Site ID: ' + $scope.activeSite.Id);
		}
		angular.forEach(value, function(value, key) {
			if($scope.countSelected = 0){
				$scope.activeSite
			}
			if(key.indexOf("Allow") != -1){
				$scope.sitePerms[key] = value;
			}
		}, value);
	}
	
	$scope.globalMsg = '';
	$scope.globalMsgClass = 'hidden';
	
	$scope.showGlobalMsg = function(warning, message){
		$scope.globalMsgClass = warning;
		$translate(message).then(function(data){
			$scope.globalMsg = data;
			
			setTimeout(function(){
				$scope.globalMsgClass = 'hidden';
			}, 5000);

		}, function(error) {
	        // promise rejected :(
	            $scope.globalMsg = error;
				$scope.clearSelections();
					
		});
	}
	
	$scope.purchaseSites = function(row){
		var purchaseIds = '';
		if($scope.selectedRows.length > 1){
			angular.forEach($scope.selectedRows, function(value, key) {
				purchaseIds += value.Id + ',';
			}, $scope.selectedRows);
			window.location.href = 'MultipleSubscriptions?ids=' + purchaseIds;			
		}else{
			window.location.href = 'ChooseYourPlan?chp=' + $scope.activeSite.Id;
		}
	}
	
	$scope.deleteSites = function(row){
		var deleteSelectionIds = [];
		var deletionNames = [];
		var singleDel = '';
		angular.forEach($scope.selectedRows, function(value, key) {
			deleteSelectionIds.push(value.Id);
		}, $scope.selectedRows);
		VFRemotingFactory.sfRemote('bulkDelete', [deleteSelectionIds]).then(function(response){
				if (response.type === 'exception') {
					if(response.statusCode == 500){
						$scope.showGlobalMsg('error', 'expired');
					} else {
						$scope.showGlobalMsg('error', response.message);	
					}
				} else{
					//do it
					console.log('Deleting');
					angular.forEach($scope.selectedRows, function(rowItem) { 
						$scope.myData.splice($scope.myData.indexOf(rowItem),1);
					});
					$scope.showGlobalMsg('successful', 'deletionSuccessful');
					$scope.clearSelections();
					
					$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);	
		
					
					
					setTimeout(function(){
						$scope.gridOptions.selectedItems = [];
						$scope.clearSelections();
					}, 2000);
					
					
		
				}
			},
			function(error)  {
				$scope.showGlobalMsg('warning', error.message);
			}
		); 
	}
	
	$scope.cacheCellEdit = '';
	
	$scope.$on('ngGridEventStartCellEdit', function (evt) {
		$scope.cacheCellEdit = evt.targetScope.row.entity.Mobile_Site_Name__c;
	});
	
	$scope.$on('ngGridEventEndCellEdit', function(evt){
		var field = evt.targetScope.row.entity.Mobile_Site_Name__c; // the underlying data bound to the row
		if(field != $scope.cacheCellEdit){
			VFRemotingFactory.sfRemote('changeName', [evt.targetScope.row.entity.Id, field]).then(function(response){
					$scope.expired(response, 'Name Changed', 'nameChangeSuccess');
				},
				function(error)  {
					$scope.showGlobalMsg('warning', error.message);
				}
			);
		}
	});
	
	$scope.cacheDomain = function(){
		$scope.cacheDomainVal = $scope.activeSite.Custom_Mobile_Domain__c;
	};
	
	$scope.sendCustomDomain = function(){
		if($scope.activeSite.Custom_Mobile_Domain__c == $scope.cacheDomainVal){
			return
		} else {
			var letterNumber = /^[0-9a-zA-Z.]+$/;
			if($scope.activeSite.Custom_Mobile_Domain__c.match(letterNumber)){
				
				VFRemotingFactory.sfRemote('changeCustomDomain', [$scope.activeSite.Id, $scope.activeSite.Custom_Mobile_Domain__c]).then(function(response){
						$scope.expired(response, 'Custom Domain Name Changed', 'customChangeSuccess');
					},
					function(error)  {
						$scope.showGlobalMsg('warning', error.message);
					}
				); 					
			} else {
				$scope.showGlobalMsg('warning', 'customAlpha');
				$scope.activeSite.Custom_Mobile_Domain__c = $scope.cacheDomainVal;
			}
		}
	};
	
	
	$scope.remoteSf = function(){
		//Move sf calls here
	};
	
	$scope.expired = function(response, successLog, successMsg){
		if (response.type === 'exception') {
			if(response.statusCode == 500){
				$scope.showGlobalMsg('error', 'expired');
			} else {
			$scope.showGlobalMsg('error', response.message);	
			}
		} else{
			//Make it so
			console.log(successLog);
			if(successMsg) $scope.showGlobalMsg('successful', successMsg);
			$scope.clearSelections();
		}
	};

	
	$scope.retrieveUsers = function(){
		VFRemotingFactory.sfRemote('getPartnerUsers', ['2345678976']).then(function(response){
				console.log(response);
			},
			function(error)  {
				$scope.showGlobalMsg('warning', error.message);
			}
		); 
	
	};	

	$scope.$watch('selectedRows', function (newVal, oldVal) {
		//console.log('now: ' + newVal + ' was: ' + oldVal);
		$scope.countSelected = newVal.length;
		if(newVal.length > 0){
			if(newVal.length == 1){
				$scope.checkSite(newVal[0], false);
			} else {
				angular.forEach(newVal, function(value, key) {
					$scope.checkSite(value, true);
				}, newVal);
			}
		}
		/*
		if (newVal !== oldVal) {
          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
		*/
	}, true);
	
	$scope.$watch('userSettings', function (newVal, oldVal) {
		if(newVal.defaultSites != oldVal.defaultSites){
			$scope.getPagedDataAsync(newVal.defaultSites, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
		}localStorageService.set('bMpDsettings', $scope.userSettings)
	}, true);	
	
	
	
	
	
	
	
}).directive('sendTitle', function() {
	return function(scope, element, attr) { 
		var hovering = false;
		var headerDiv = $('.groupActions');

		element.on('mouseover', function(event) {
			if(headerDiv.hasClass('multiSelect')){ //this is a hack because our scope.multiSelect var isn't coming through
				//cacheMulti = true;
			} else {
				hovering = true;
				scope.$apply(function(){
				   scope.headMessage = element.attr('title');
				});
			}
		});

		element.on('mouseout', function(event) {
			if(headerDiv.hasClass('multiSelect')){
				//cacheMulti = true;
			} else {
				
				hovering = false;
				setTimeout(function(){
					if(!hovering){
						scope.$apply(function(){
							scope.headMessage = '';
						});
					}
				}, 2000);
			}
		});
	}
});



