using Core.Entities;

namespace Core.Specifications;

public class CampsiteSpecification : BaseSpecification<Campsite>
{
    public CampsiteSpecification(BaseSpecParams specParams) : base(null)
    {
        ApplyPaging(specParams.PageSize * (specParams.PageNumber - 1), specParams.PageSize);
        AddInclude(x => x.CampsiteType);
    }
}