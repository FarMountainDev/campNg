using Core.Entities;

namespace Core.Specifications;

public class CampgroundSpecification : BaseSpecification<Campground>
{
    public CampgroundSpecification(BaseSpecParams specParams) : base(x => 
        (string.IsNullOrWhiteSpace(specParams.Search) || x.Name.ToLower().Contains(specParams.Search)))
    {
        ApplyPaging(specParams.PageSize * (specParams.PageNumber - 1), specParams.PageSize);
        AddInclude(x => x.Campsites!);
        AddThenInclude<CampsiteType, Campsite>(
            x => x.Campsites!, 
            c => c.CampsiteType!);

        switch (specParams.Sort)
        {
            default:
                AddOrderBy(x => x.Name);
                break;
        }
    }

    public CampgroundSpecification(int id) : base(x => x.Id == id)
    {
        AddInclude(x => x.Campsites!);
        AddThenInclude<CampsiteType, Campsite>(
            x => x.Campsites!, 
            c => c.CampsiteType!);
    }
}