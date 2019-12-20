#include "RefUtilsModule.h"
#include <youireact/ShadowTree.h>
#include <youireact/nodes/ReactComponent.h>
#include <youireact/nodes/ShadowRegistry.h>
#include <youireact/CompositionView.h>

static const CYIString TAG("RefUtilsModule");

using namespace yi::react;

YI_RN_INSTANTIATE_MODULE(RefUtilsModule);

RefUtilsModule::RefUtilsModule() { }

CYISceneNode* RefUtilsModule::GetShadowTreeCounterpart(IBridge &bridge, uint64_t tag)
{
    auto &shadowRegistry = bridge.GetShadowTree().GetShadowRegistry();
    auto pComponent = shadowRegistry.Get(tag);
    YI_ASSERT(pComponent, TAG, "Shadow view with tag %" PRIu64 " not found in ShadowRegistry", tag);
    auto pCounterpart = pComponent->GetCounterpart();
    YI_ASSERT(pCounterpart, TAG, "Shadow view with tag %" PRIu64 " doesn't have a counterpart", tag);

    return pCounterpart;
}

YI_RN_DEFINE_EXPORT_METHOD(RefUtilsModule, setPointerEvents)(uint64_t tag, bool mode) {
    auto pCounterpart = GetShadowTreeCounterpart(GetBridge(), tag);
    
    while ( dynamic_cast<CompositionView *>(pCounterpart) == NULL) {
        pCounterpart = pCounterpart->GetParent();
    }
    
    if (mode) {
        pCounterpart->SetSpecialTypeFlag(CYIEventTarget::SpecialEventTargetType::None);
    } else {
        pCounterpart->SetSpecialTypeFlag(CYIEventTarget::SpecialEventTargetType::NoPick);
    }
}

YI_RN_DEFINE_EXPORT_METHOD(RefUtilsModule, setParentCompositionPointerEvents)(uint64_t tag, bool mode) {
    auto pCounterpart = GetShadowTreeCounterpart(GetBridge(), tag);
    
    while ( dynamic_cast<CompositionView *>(pCounterpart) == NULL) {
        pCounterpart = pCounterpart->GetParent();
    }
    
    if (mode) {
        pCounterpart->SetSpecialTypeFlag(CYIEventTarget::SpecialEventTargetType::None);
    } else {
        pCounterpart->SetSpecialTypeFlag(CYIEventTarget::SpecialEventTargetType::NoPick);
    }
}
