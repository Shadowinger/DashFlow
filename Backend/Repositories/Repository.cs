using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Backend.Repositories
{
    public class Repository<T> : IRepository<T> where T : BaseEntity
    {
        // Implementation will go here
    }
} 