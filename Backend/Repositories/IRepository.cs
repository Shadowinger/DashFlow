using Backend.Models;
using System.Linq.Expressions;

namespace Backend.Repositories
{
    public interface IRepository<T> where T : BaseEntity
    {
        // CRUD methods will go here
    }
} 