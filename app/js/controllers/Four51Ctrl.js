four51.app.controller('Four51Ctrl', ['$scope', '$route', '$location', '$451', 'Punchout', 'User', 'Order', 'Security', 'OrderConfig', 'Category', 'AppConst','XLATService',
function ($scope, $route, $location, $451, Punchout, User, Order, Security, OrderConfig, Category, AppConst, XLATService) {
	$scope.AppConst = AppConst;
	$scope.scroll = 0;
	$scope.isAnon = $451.isAnon; //need to know this before we have access to the user object
	$scope.Four51User = Security;
	if ($451.isAnon && !Security.isAuthenticated()) {
		User.login(function () {
			$route.reload();
		});
	}

	    //get user Data
    User.get(function (user, data) {
        $scope.userData = user;
	groupName = $scope.groupName = user.Groups[0].Name;
    });

	//get companyId
	var companyId = $scope.companyId = document.getElementsByTagName('base')[0].attributes[0].value.replace(/[^0-9]+/g, '');
    	var ftpUrlPrefix = $scope.ftpUrlPrefix = 'https://www.four51.com/Themes/Custom/df7e2b71-6326-4da6-a24f-554d7d910faf/companyId/' + companyId;
    
    //check for current Background Property. If is set to FTP link, ignore. If not, redefine. If color, same...
    $scope.currentBackgroundPropertyUrl = window.getComputedStyle(document.body).getPropertyValue('background').indexOf('df7e2b71-6326-4da6-a24f-554d7d910faf');
    $scope.currentBackgroundPropertyHex = window.getComputedStyle(document.body).getPropertyValue('background').indexOf('#');
    if ($scope.currentBackgroundPropertyUrl === -1 && $scope.currentBackgroundPropertyHex === -1) {
        document.body.style.background = "url('https://www.four51.com/Themes/Custom/df7e2b71-6326-4da6-a24f-554d7d910faf/companyId/" + companyId + "/" + companyId + "-bgbody.jpg') no-repeat center center fixed";
        document.body.style.backgroundSize = "cover";
    }
    
	// fix Bootstrap fixed-top and fixed-bottom from jumping around on mobile input when virtual keyboard appears
	if ($(window).width() < 960) {
		$(document)
			.on('focus', ':input:not("button")', function (e) {
				$('.navbar-fixed-bottom, .headroom.navbar-fixed-top').css("position", "relative");
			})
			.on('blur', ':input', function (e) {
				$('.navbar-fixed-bottom, .headroom.navbar-fixed-top').css("position", "fixed");
			});
	}
	$scope.PunchoutSession = Punchout.punchoutSession;

	if($scope.PunchoutSession.PunchOutOperation == 'Edit') $location.path('cart');
	else if($scope.PunchoutSession.PunchoutLandingCategory) $location.path('catalog/' + $scope.PunchoutSession.PunchoutLandingCategory);
	else if($scope.PunchoutSession.PunchoutLandingProduct) $location.path('product/' + $scope.PunchoutSession.PunchoutLandingProduct);

	function init() {
		if (Security.isAuthenticated()) {
			User.get(function (user) {
				$scope.user = user;
                $scope.user.Culture.CurrencyPrefix = XLATService.getCurrentLanguage(user.CultureUI, user.Culture.Name)[1];
                $scope.user.Culture.DateFormat = XLATService.getCurrentLanguage(user.CultureUI, user.Culture.Name)[2];
				if($scope.PunchoutSession.PunchOutOperation == 'Inspect') $location.path('order/' + $scope.user.CurrentOrderID);

	            if (!$scope.user.TermsAccepted)
		            $location.path('conditions');

				if (user.CurrentOrderID) {
					Order.get(user.CurrentOrderID, function (ordr) {
						$scope.currentOrder = ordr;
						OrderConfig.costcenter(ordr, user);
					});
				}
				else
					$scope.currentOrder = null;

			});
			Category.tree(function (data) {
				$scope.tree = data;
				$scope.$broadcast("treeComplete", data);
			});
		}
	}

	function analytics(id) {
		if (id.length == 0) return;
		(function (i, s, o, g, r, a, m) {
			i['GoogleAnalyticsObject'] = r;
			i[r] = i[r] || function () {
				(i[r].q = i[r].q || []).push(arguments)
			}, i[r].l = 1 * new Date();
			a = s.createElement(o),
				m = s.getElementsByTagName(o)[0];
			a.async = 1;
			a.src = g;
			m.parentNode.insertBefore(a, m)
		})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

		ga('create', id, 'four51.com');
		ga('require', 'ecommerce', 'ecommerce.js');
	}

	try {
		trackJs.configure({
			trackAjaxFail: false
		});
	}
	catch(ex) {}

    $scope.errorSection = '';

    function cleanup() {
        Security.clear();
    }

    $scope.$on('event:auth-loginConfirmed', function(){
        $route.reload();
	    User.get(function(user) {
		    analytics(user.Company.GoogleAnalyticsCode);
	    });
	});
	$scope.$on("$routeChangeSuccess", init);
    $scope.$on('event:auth-loginRequired', cleanup);
}]);
