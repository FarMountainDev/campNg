using Core.Entities;

namespace Core.Specifications;

public class CampgroundSpecification : BaseSpecification<Campground>
{
    public CampgroundSpecification(int? id = null) : base()
    {
        AddInclude(x => x.Campsites!);
    }

    public CampgroundSpecification(int id) : base(x => x.Id == id)
    {
        AddInclude(x => x.Campsites!);
    }
}