var models = require("../models");
var Users = models.User;
var Address = models.Address;
var Country = models.Country;
var State = models.State;
var City = models.City;
var Category = models.Category;
var Type = models.Type;
var Promotions = models.Promotion;
var Review = models.Review;
var Reservation = models.Reservation;
var Schedule = models.Schedule;
var Menu = models.Menu;
var Places = models.Place;
var Parent = models.Parent;
var Card = models.Card;
var Charge = models.Charge;
var Coupon = models.Coupon;
var Ticket = models.Ticket;
var Product = models.Product;
var Order = models.Order;
var OrderDetail = models.OrderDetail;
var BankAccount = models.BankAccount;
var Deposit = models.Deposit;
var Admin = models.Admin;
var Print = models.Print;
var Notification = models.Notification;
var Favorite = models.Favorite;
var Reset = models.Reset;
var Option = models.Option;
var Code = models.Code;
var CodeLog = models.CodeLog;

var UserController = require("../controllers/user");
var AddressController = require("../controllers/address");
var CountryController = require("../controllers/country");
var StateController = require("../controllers/state");
var CityController = require("../controllers/city");
var CategoryController = require("../controllers/category");
var TypeController = require("../controllers/type");
var PromotionController = require("../controllers/promotion");
var ReviewController = require("../controllers/review");
var ReservationController = require("../controllers/reservation");
var ScheduleController = require("../controllers/schedule");
var MenuController = require("../controllers/menu");
var PlaceController = require("../controllers/place");
var ParentController = require("../controllers/parent");
var CardController = require("../controllers/card");
var ChargeController = require("../controllers/charge");
var CouponController = require("../controllers/coupon");
var TicketController = require("../controllers/ticket");
var ProductController = require("../controllers/product");
var OrderController = require("../controllers/order");
var DetailController = require("../controllers/orderDetail");
var BankAccountController = require("../controllers/bankAccount");
var DepositController = require("../controllers/deposit");
var AdminController = require("../controllers/admin");
var PrintController = require("../controllers/print");
var NotificationController = require("../controllers/notification");
var FavoriteController = require("../controllers/favorite");
var ResetController = require("../controllers/reset");
var OptionController = require("../controllers/option");
var tron = require('../controllers/tron');
var CodeLogController = require('../controllers/CodeLog');
var SupportController = require('../controllers/support');
var DeliveryController = require('../controllers/delivery');
var HubController = require('../controllers/hub');
var CodeController = require('../controllers/code');
var FranchiseController = require('../controllers/franchise');

var auth = require("../middleware/authorization");
module.exports = function(app) {

//Server Working
	app.get("/", function (req, res) {
		res.send ('<h1> Knowledger Working </h1>');
	})
//User
	app.get("/user", auth.valid, UserController.getAllUsers);
	app.post("/user", UserController.postUser);
	app.post("/user/login", UserController.logIn);
	app.put("/user/photo", auth.valid, UserController.editUserPhoto);
	app.put("/confirmation/user", UserController.confirmAccount);
	app.post("/user/image", auth.valid, UserController.uploadImage);
	app.post("/user/pushtoken", auth.valid, UserController.editPushToken);
	app.post("/unregistered/user", auth.valid, UserController.postUnregisteredUser);

//Address
	app.get("/address/:idPlace", AddressController.getAddressOfIdPlace);
	app.post("/address", auth.valid, AddressController.postAddress);
	app.get("/addressUser", auth.valid, AddressController.getAddressOfidUser);
	app.get("/one/user/address", auth.valid, AddressController.getSpecificAddressUser);
	app.post("/address/user", auth.valid, AddressController.postAddressUser);
	app.delete('/address/user', auth.valid, AddressController.hideUserAddress);
	app.put("/address", auth.valid, AddressController.editAddress);
	app.put("/user/address", auth.valid, AddressController.editAddressUser);
	app.get("/city/place", AddressController.getPlacesByCity);

//COUNTRY
	app.get("/country", CountryController.getAllCountry);
	app.post("/country", CountryController.postCountry);
	app.delete("/country/:id", CountryController.deleteCountry);
	app.put("/country/:id", CountryController.editCountry);

//STATE
	app.get("/state", StateController.getAllStates);
	app.get("/state/:idCountry", StateController.getStatesByCountry);
	app.post("/state", StateController.postState);
	app.delete("/state/:id", StateController.deleteState);
	app.put("/state/:id", StateController.editState);

//CITY
	app.get("/city", CityController.getAllCity);
	app.get("/city/search", CityController.getCityByName);
	app.get("/city/:idState", CityController.getCityByState);
	app.post("/city", CityController.postCity);
	app.delete("/city/:id", CityController.deleteCity);
	app.put("/city/:id", CityController.editCity);

//CATEGORY
	app.get("/category", CategoryController.getAllCategory);
	app.get("/category/type", CategoryController.getCategoryByType);
	app.post("/category", CategoryController.postCategory);
	app.delete("/category/:id", CategoryController.deleteCategory);
	app.put("/category/:id", CategoryController.editCategory);
	app.get("/category/random", CategoryController.getRandomCategory);

//TYPE
	app.get("/type", TypeController.getAllType);
	app.post("/type", TypeController.postType);
	app.delete("/type/:id", TypeController.deleteType);
	app.put("/type/:id", TypeController.editType);

//PROMOTIONS
	app.get("/promotion", PromotionController.getAllPromotion);
	app.get("/promotion/:idPlace", PromotionController.getPromotionByPlace);
	app.post("/promotion", auth.valid, PromotionController.postPromotion);
	app.delete("/promotion", auth.valid, PromotionController.deletePromotion);
	app.put("/promotion/:id", auth.valid, PromotionController.editPromotion);
	app.post("/promotion/image", auth.valid, PromotionController.uploadImage);
	app.get("/one/promotion", PromotionController.getOnePromotion)


	app.get("/new/review", ReviewController.getLastReviews);
	app.get("/review/:idPlace", ReviewController.getReviewByPlace);
	app.post("/review", auth.valid, ReviewController.postReview);
	app.get("/review/average/:idPlace",ReviewController.getReviewAVGByPlace);

//RESERVATIONS
	app.get("/reservation", auth.valid, ReservationController.getAllReservation);
	app.get("/reservationUser", auth.valid, ReservationController.getOneReservationUser);
	app.get("/reservation/place/:idPlace", ReservationController.getReservationByPlace);
	app.get("/reservation/status", ReservationController.getReservationByStatus);
	app.post("/reservation", auth.valid, ReservationController.postReservation);
	app.put("/reservation/confirm", ReservationController.editReservation);
	app.get("/reservation/dates", ReservationController.getReservationDates);
	app.get("/prepay/reservation", auth.valid, ReservationController.getReservationForPrePay);
	app.get("/check/order/reservation", auth.valid, ReservationController.getReservationForOrder);
	app.post("/unregistered/reservation", auth.valid, ReservationController.UnregisteredReservation);

//SCHEDULE
	app.get("/schedule/:idPlace", ScheduleController.getScheduleByPlace);
	app.get("/day/schedule", ScheduleController.getScheduleDay);
	app.get("/search/schedule/day", ScheduleController.getSearchScheduleDay);
	app.post("/schedule", auth.valid, ScheduleController.postSchedule);
	app.delete("/schedule", auth.valid, ScheduleController.deleteSchedule);
	app.put("/schedule/manage", auth.valid, ScheduleController.editSchedule);
	app.get("/reservation/schedule",ScheduleController.getScheduleReservate);
	app.get("/verify/open/schedule",ScheduleController.verifyOpen);

//MENU
	app.get("/menu", MenuController.getMenuByPlace);
	app.post("/menu", auth.valid, MenuController.postMenu);
	app.delete("/menu", auth.valid, MenuController.deleteMenuByPlace);
	app.put("/menu/manage", auth.valid, MenuController.editMenu);
	app.post("/menu/image", auth.valid, MenuController.uploadImage);

//PLACES
	app.post("/place", auth.valid, PlaceController.postPlace);
	app.post("/place/image", PlaceController.uploadImage);
	app.put("/place/manage", auth.valid, PlaceController.editPlaceBasic);
	app.put("/place/image/coverPicture", auth.valid, PlaceController.editPlaceView);
	app.put("/place/image/logo", auth.valid, PlaceController.editPlaceLogo);
	app.delete("/place", auth.valid, PlaceController.deletePlaceById);
	app.get("/place", PlaceController.getAllPlace);
	app.get("/place/search", PlaceController.getSearchPlaces);
	app.get("/place/profile", PlaceController.getPlace);
	app.get("/distance/measure/place", PlaceController.measureDistance);
	app.get("/place/type/:idType", PlaceController.getPlaceByType); //FIX
	app.get("/place/category/:idCategory", PlaceController.getPlaceByCategory); //FIX
	app.get("/place/near", PlaceController.getPlacesNear);
	app.get("/place/service/near", PlaceController.getPlacesNearByService);
	app.get("/place/reservation/near", PlaceController.getPlacesNearByReservation);//DELETE

//Parent
	app.get("/parent", ParentController.getAllParent);
	app.post("/parent", ParentController.postParent);
	app.delete("/parent/:id", ParentController.deleteParentById);
	app.put("/parent/:id", ParentController.editParentById);

//Card
	app.post("/card", auth.valid, CardController.postCard);
	app.get("/card", auth.valid, CardController.getCardByUser);
	app.delete("/card", auth.valid, CardController.deleteCardById);

//Charge
	app.post("/charge",  auth.valid, ChargeController.postCharge);
	app.post("/trip/external",  auth.valid, ChargeController.postExternalTrip);
	app.get("/charge", auth.valid, ChargeController.getChargeByUser);
	app.get("/credit/place", auth.valid, ChargeController.getChargeByPlace);
	app.get("/charge/last",ChargeController.getLastCharge);
	app.post("/charge/order",  auth.valid, ChargeController.postChargeOrder);
	app.post("/charge/print",  auth.valid, ChargeController.postPrint);
	app.get("/creditSum/place", auth.valid, ChargeController.getTotalCreditPlace);
	app.get("/totalSum", ChargeController.placeSum);
	app.get("/pendingPlaceSum", ChargeController.placePendingSum);
	app.get("/weeklyProfit", ChargeController.weeklyProfit);
	app.get("/weeklySell", ChargeController.weeklySell);

//Coupon
	app.get("/coupon", CouponController.getAllCoupons);
	app.get("/coupon/place", CouponController.getCouponByPlace);
	app.post("/coupon/image",CouponController.uploadImage);
	app.post("/coupon",  auth.valid, CouponController.postCoupon);
	app.get("/one/coupon", CouponController.getOneCoupon);

//Ticket
	app.get("/ticket", auth.valid, TicketController.getAllTickets);
	app.get("/ticket/place", TicketController.getTicketByPlace);
	app.get("/ticket/coupon", auth.valid, TicketController.getTicketByCoupon);
	app.get("/ticket", auth.valid, TicketController.getTicketByStatus);
	app.post("/ticket",  auth.valid, TicketController.postTicket);
	app.put("/ticket", auth.valid, TicketController.editTicket);
	app.get("/ticket/used", auth.valid, TicketController.getTicketsUsed);
	app.get("/ticket/user", auth.valid, TicketController.getTicketsUser);


//Products
	app.post("/product", auth.valid, ProductController.postProduct);
	app.post("/product/image", ProductController.uploadImage);
	app.put("/product/edit",  auth.valid, ProductController.editProduct);
	app.put("/product/image", auth.valid, ProductController.uploadProductPhoto);
	app.put("/product/delete",  auth.valid, ProductController.deleteProduct);
	app.put("/unstock/product",  auth.valid, ProductController.unstockProduct);
	app.get("/product/place", ProductController.getProductByPlace);
	app.get("/one/product", ProductController.getSpecificProduct);


//Orders
	app.get("/order/user", auth.valid, OrderController.getOrderUser);
	app.get("/orderPending", auth.valid, OrderController.getWaiting);
	app.get("/order/placeHistory", auth.valid, OrderController.getHistory);
	app.post("/order/pickUp", auth.valid, OrderController.postOrder);
	app.post("/order/prePay", auth.valid, OrderController.postPrepay);
	app.get("/orderZoom", auth.valid, OrderController.getOneOrder);
	app.get("/orderUser", auth.valid, OrderController.getUserOrder);
	app.put("/order/decline", auth.valid, OrderController.declineOrder);
	app.get("/date/order", auth.valid, OrderController.getOrderDates);
	app.post("/delivered/order", auth.valid, OrderController.deliveredOrder);
	app.get("/confirmed/check", auth.valid, OrderController.getConfirmedDay);
	app.put("/reply/order", auth.valid, OrderController.sendReply);
	app.get("/order/past/search", auth.valid, OrderController.analyticsOrders);

//Details
	app.get("/order/detail", auth.valid, DetailController.getDetailByOrder);
	app.post("/order/detail", auth.valid, DetailController.postDetail);
	app.get("/trending/user", auth.valid, DetailController.getTrendingByUser);
	app.get("/global/trending", DetailController.getGlobalTrending);
	app.get("/local/trending", DetailController.getTrendingPlace);

//BankAccounts
	app.get("/bankAccount/user", auth.valid, BankAccountController.getAccountOfIdPlace);
	app.post("/bankAccount", auth.valid, BankAccountController.postAccount);
	app.put("/bankAccount", auth.valid, BankAccountController.editBankAccount);
	app.get("/bankAccount", auth.valid, BankAccountController.getPlaceBankAccount);

//Deposit
	app.get("/deposit", auth.valid, DepositController.getPlaceDeposit);
	app.get("/pending/place/deposit", auth.valid, DepositController.getPlacePendingDeposits);
	app.get("/pending/deposit/27121998", DepositController.getPendingDeposits);
	app.post("/deposit", DepositController.postDeposit);

//Admins
	app.get("/admin/place", auth.valid, AdminController.getAdminOfIdPlace);
	app.post("/add/admin", auth.valid, AdminController.postAdmin);
	app.get("/admin/user", auth.valid, AdminController.getAdminOfidUser);
	app.get("/admin/user/place", auth.valid, AdminController.getAdminOfidUserPlace);
	app.delete("/admin/delete", auth.valid, AdminController.deleteAdmin);
	app.get("/check/admin/user", auth.valid, AdminController.getUserByAdmin);

//Print
	app.get("/print", PrintController.getPrintByCity);
	app.get("/print/place", PrintController.getPrintByPlace);

//Notification
	app.get("/notification", auth.valid, NotificationController.getNotification);
	app.get("/notification/pending", auth.valid, NotificationController.getCountNotification);

//Favorite
	app.get("/favorite", auth.valid, FavoriteController.getFavorite);
	app.post("/upload/favorite", auth.valid, FavoriteController.postFavorite);
	app.get("/favorite/place", auth.valid, FavoriteController.getFavoritePlace);
	app.delete("/delete/favorite", auth.valid, FavoriteController.deleteFavorite);

//Reset
	app.post("/reset/password", ResetController.postResetPassword);
	app.put("/confirm/password/reset", ResetController.PutresetPassword);

//Option
	app.get("/options/product", OptionController.getOptions);

//Code Log
	app.post("/promoCode", auth.valid, CodeLogController.verifyCode);
	app.post("/promoCode/product", auth.valid, CodeLogController.verifyProductCode);

//Support
	app.get("/emitCall", SupportController.callEmit);
	app.post("/support/push/user", SupportController.sendPushUser);
	app.post("/support/extend/order", SupportController.extendOrder);
	app.get("/support/pending/order", SupportController.pendingOrder);

//Support
	app.post("/delivery/subscribe", DeliveryController.subscribePlace);
	app.post("/delivery/lateTrip", DeliveryController.lateTrip);
	app.put("/delivery/cancelTrip", DeliveryController.cancelTrip);
	app.post("/external/deposit", DeliveryController.deliveryDeposit);
	app.get("/trips/oncourse", DeliveryController.pendingTrips);

//Hub
	app.post("/hub/codediscounts/upload", HubController.postCode);
	app.post("/hub/admin/place", HubController.addPlaceAdmin);
	app.get("/hub/admin/place", HubController.fetchAdminOfPlace);
	app.delete("/hub/admin/place", HubController.removePlaceAdmin);
	app.get("/hub/bankAccount", HubController.bankAccountPlace);
	app.get("/hub/place/subscription", HubController.getSubscriptionPlace)
	app.get("/hub/codediscounts", HubController.fetchActualCodes);
	app.get("/hub/users/unactive", HubController.fetchUnactiveUsers);
	app.put("/hub/users/unactive", HubController.activateHiddenUser);
	app.get("/hub/place/unactive", HubController.fetchUnactivePlaces);
	app.put("/hub/place/unactive", HubController.activateHiddenPlace);

//Code
	app.post("/code/product", auth.valid, CodeController.postProductCode);
	app.put("/code/unactive", auth.valid, CodeController.unactiveProductCode);
	app.get("/code/place", CodeController.fetchProductPromos);

//Franchise
	app.get("/franchise/place", FranchiseController.getFranchiseLoc);
	app.get("/franchise/products", FranchiseController.getProductsByFranchise);
}
