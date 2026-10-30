package com.litera.backend;

import com.litera.backend.model.Book;
import com.litera.backend.model.BookStatus;
import com.litera.backend.model.PaymentStatus;
import com.litera.backend.model.Role;
import com.litera.backend.model.User;
import com.litera.backend.repository.BookRepository;
import com.litera.backend.repository.PaymentRepository;
import com.litera.backend.repository.UserRepository;
import com.litera.backend.service.CartService;
import com.litera.backend.service.OrderService;
import com.litera.backend.service.PaymentService;
import com.litera.backend.controller.AuthController;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.web.FilterChainProxy;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class BackendApplicationTests {
	private MockMvc mockMvc;

	@Autowired
	private WebApplicationContext applicationContext;

	@Autowired
	private FilterChainProxy springSecurityFilterChain;

	@Autowired
	private UserRepository users;

	@Autowired
	private BookRepository books;

	@Autowired
	private CartService carts;

	@Autowired
	private OrderService orders;

	@Autowired
	private PaymentService payments;

	@Autowired
	private PaymentRepository paymentRepository;

	@Autowired
	private Validator validator;

	@BeforeEach
	void setUpMockMvc() {
		mockMvc = MockMvcBuilders.webAppContextSetup(applicationContext)
				.addFilters(springSecurityFilterChain)
				.build();
	}

	@Test
	void contextLoads() {
	}

	@Test
	void registrationRejectsShortPasswordsAndInvalidEmails() {
		AuthController.RegisterRequest request = new AuthController.RegisterRequest(
				"New User", "not-an-email", null, "short");

		var violations = validator.validate(request);

		Assertions.assertTrue(violations.stream().anyMatch(violation ->
				violation.getPropertyPath().toString().equals("password")));
		Assertions.assertTrue(violations.stream().anyMatch(violation ->
				violation.getPropertyPath().toString().equals("email")));
	}

	@Test
	void pendingUpiCheckoutReservesStockUntilAdminVerification() {
		User seller = users.save(new User("Seller", "seller@example.test", null, "encoded", Role.USER));
		User buyer = users.save(new User("Buyer", "buyer@example.test", null, "encoded", Role.USER));

		Book paidBook = book("Paid book", 100.0, 1, seller);
		Book unpaidBook = book("Unpaid book", 200.0, 2, seller);
		books.save(paidBook);
		books.save(unpaidBook);

		carts.addItem(buyer, paidBook.getId(), 1);
		OrderService.OrderView paidOrder = orders.checkout(buyer, "1 Main Street, Prayagraj", "UPI-PAID-001");
		Assertions.assertEquals("PENDING", paidOrder.paymentStatus());
		Assertions.assertEquals(0, paidOrder.totalAmount().compareTo(new java.math.BigDecimal("145.00")));

		payments.updateStatus(paymentRepository.findByOrderId(paidOrder.id()).orElseThrow().getId(),
				PaymentStatus.SUCCESS);
		Book soldBook = books.findById(paidBook.getId()).orElseThrow();
		Assertions.assertEquals(Integer.valueOf(0), soldBook.getQuantity());
		Assertions.assertEquals(BookStatus.SOLD_OUT, soldBook.getStatus());

		carts.addItem(buyer, unpaidBook.getId(), 1);
		OrderService.OrderView failedOrder = orders.checkout(buyer, "1 Main Street, Prayagraj", "UPI-FAILED-001");
		payments.updateStatus(paymentRepository.findByOrderId(failedOrder.id()).orElseThrow().getId(),
				PaymentStatus.FAILED);
		Book releasedBook = books.findById(unpaidBook.getId()).orElseThrow();
		Assertions.assertEquals(Integer.valueOf(2), releasedBook.getQuantity());
		Assertions.assertEquals(Integer.valueOf(0), releasedBook.getReservedQuantity());
	}

	@Test
	void publicRoutesWorkAndAdminRoutesRejectNonAdminSessions() throws Exception {
		mockMvc.perform(get("/api/books")).andExpect(status().isOk());
		mockMvc.perform(get("/api/checkout/config")).andExpect(status().isOk());
		mockMvc.perform(get("/api/cart")).andExpect(status().isUnauthorized());
		mockMvc.perform(get("/api/admin/users")).andExpect(status().isUnauthorized());

		User regularUser = users.save(new User("Regular", "regular@example.test", null, "encoded", Role.USER));
		MockHttpSession userSession = session(regularUser.getEmail(), "ROLE_USER");
		mockMvc.perform(get("/api/cart").session(userSession)).andExpect(status().isOk());
		mockMvc.perform(get("/api/orders/mine").session(userSession)).andExpect(status().isOk());
		mockMvc.perform(get("/api/payments/mine").session(userSession)).andExpect(status().isOk());
		mockMvc.perform(get("/api/admin/users").session(userSession)).andExpect(status().isForbidden());
		mockMvc.perform(get("/admin/test").session(userSession)).andExpect(status().isForbidden());

		MockHttpSession adminSession = session("admin@example.test", "ROLE_ADMIN");
		mockMvc.perform(get("/api/admin/users").session(adminSession)).andExpect(status().isOk());
		mockMvc.perform(get("/api/admin/orders").session(adminSession)).andExpect(status().isOk());
		mockMvc.perform(get("/api/admin/payments").session(adminSession)).andExpect(status().isOk());
		mockMvc.perform(get("/api/admin/books/pending/count").session(adminSession)).andExpect(status().isOk());
	}

	private MockHttpSession session(String principal, String authority) {
		SecurityContext context = SecurityContextHolder.createEmptyContext();
		context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(
				principal, null, List.of(new SimpleGrantedAuthority(authority))));
		MockHttpSession session = new MockHttpSession();
		session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
		return session;
	}

	private Book book(String title, double price, int quantity, User seller) {
		Book book = new Book();
		book.setTitle(title);
		book.setAuthor("Test author");
		book.setPrice(price);
		book.setQuantity(quantity);
		book.setCategory("Test");
		book.setSeller(seller);
		book.setStatus(BookStatus.APPROVED);
		return book;
	}
}
