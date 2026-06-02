using System.Collections.Generic;
using Moq;
using Xunit;
using FluentAssertions;
using HouseHoldApp.DataAccess;
using HouseHoldApp.Models;
using HouseHoldApp.Services;

namespace HouseHoldApp.Tests.Services
{
    public class UserServiceTests
    {
        [Fact]
        public void GetAllUsers_ReturnsUsersFromRepository()
        {
            // Arrange
            var mockRepo = new Mock<IUserRepository>();
            mockRepo.Setup(r => r.GetAllUsers()).Returns(new List<Users>
            {
                new Users { Id = 1, Firstname = "Alice", Lastname = "Smith" },
                new Users { Id = 2, Firstname = "Bob", Lastname = "Jones" }
            });

            var service = new UserService(mockRepo.Object);

            // Act
            var result = service.GetAllUsers();

            // Assert
            result.Should().HaveCount(2);
            result[0].Firstname.Should().Be("Alice");
        }
    }
}
